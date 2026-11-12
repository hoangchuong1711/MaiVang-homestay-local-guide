import assert from "node:assert/strict";
import test from "node:test";
import { parsePlaces, imageUrl, googleMapUrl } from "../src/lib/places";
import { directionsUrl, distanceKm, homestay } from "../src/lib/config";

test("parses quoted commas, line breaks and UTF-8 Vietnamese", () => {
  const csv = '\uFEFFid,name,category,lat,lng,description\r\na,"Quán, Mai Vàng",Food,10.23,106.37,"Line one\nLine two"';
  const { places, skipped } = parsePlaces(csv);
  assert.equal(skipped, 0);
  assert.equal(places[0].name, "Quán, Mai Vàng");
  assert.equal(places[0].description, "Line one\nLine two");
});
test("rejects missing coordinates, unknown category, duplicate IDs and malformed rows", () => {
  const { places, skipped } = parsePlaces('id,name,category,lat,lng\na,First,Food,10,106\na,Duplicate,Food,10,106\nb,Missing,Food,,106\nc,Bad,Cinema,10,106\nd,Range,Food,91,106\ne,Shifted,Food,10,106,extra');
  assert.equal(places.length, 1);
  assert.equal(skipped, 5);
});
test("rejects HTML login responses and missing schema", () => {
  assert.throws(() => parsePlaces('<html>Sign in</html>'));
  assert.throws(() => parsePlaces('name,description\nHi,there'));
});
test("keeps direct HTTPS photo links unchanged and omits demo photos", () => {
  assert.equal(imageUrl('https://res.cloudinary.com/demo/image/upload/sample.jpg'), '');
  assert.equal(imageUrl('javascript:alert(1)'), '');
  assert.equal(imageUrl('http://example.com/photo.jpg'), '');
  assert.equal(imageUrl('https://res.cloudinary.com/maivang/image/upload/v1/place.jpg'), 'https://res.cloudinary.com/maivang/image/upload/v1/place.jpg');
  assert.equal(imageUrl('https://res.cloudinary.com/maivang/image/upload/s--signed--/v1/place.jpg'), 'https://res.cloudinary.com/maivang/image/upload/s--signed--/v1/place.jpg');
});

test("keeps Sheet descriptions as written", () => {
  const csv = 'id,name,category,lat,lng,description\na,Island,Sightseeing,10,106,"Cù lao trên sông Tiền, thích hợp tham quan cảnh sông nước Bến Tre."';
  const { places } = parsePlaces(csv);
  assert.equal(places[0].description, "Cù lao trên sông Tiền, thích hợp tham quan cảnh sông nước Bến Tre.");
});
test("uses geographic distance in km and the destination's actual pin", () => {
  assert.equal(distanceKm(homestay, homestay), 0);
  assert.ok(Math.abs(distanceKm({ lat: 0, lng: 0 }, { lat: 0, lng: 1 }) - 111.195) < 0.01);
  assert.equal(directionsUrl(homestay), 'https://www.google.com/maps/dir/?api=1&destination=10.228855,106.3675106');
});

test("reads the expanded Sheet columns and prefers a safe Google Maps link", () => {
  const csv = [
    "id,name,category,lat,lng,google_map_url,description,what_to_order,price_range,opening_hours,closing_hours,tips,image_url,illus_x,illus_y",
    "a,Quán A,Food,10.23,106.37,https://maps.app.goo.gl/abc,Local food,Bánh xèo,₫₫,08:00,20:00,Try lunch,,42.5,61",
  ].join("\n");
  const { places, skipped } = parsePlaces(csv);
  assert.equal(skipped, 0);
  assert.equal(places[0].closingHours, "20:00");
  assert.equal(places[0].googleMapUrl, "https://maps.app.goo.gl/abc");
  assert.equal(places[0].illusX, 42.5);
  assert.equal(places[0].illusY, 61);
  assert.equal(directionsUrl(places[0]), "https://maps.app.goo.gl/abc");
});

test("ignores unsafe map links and invalid optional illustration coordinates", () => {
  const csv = "id,name,category,lat,lng,google_map_url,illus_x,illus_y\na,First,Food,10,106,javascript:alert(1),oops,";
  const { places } = parsePlaces(csv);
  assert.equal(places[0].googleMapUrl, "");
  assert.equal(places[0].illusX, null);
  assert.equal(places[0].illusY, null);
  assert.equal(directionsUrl(places[0]), "https://www.google.com/maps/dir/?api=1&destination=10,106");
  assert.equal(googleMapUrl("https://example.com/maps/place"), "");
});
