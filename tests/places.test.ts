import assert from "node:assert/strict";
import test from "node:test";
import { parsePlaces, imageUrl } from "../src/lib/places";
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
test("only optimizes real HTTPS Cloudinary assets and omits demo photos", () => {
  assert.equal(imageUrl('https://res.cloudinary.com/demo/image/upload/sample.jpg'), '');
  assert.equal(imageUrl('javascript:alert(1)'), '');
  assert.equal(imageUrl('http://example.com/photo.jpg'), '');
  assert.equal(imageUrl('https://res.cloudinary.com/maivang/image/upload/v1/place.jpg'), 'https://res.cloudinary.com/maivang/image/upload/f_auto,q_auto,w_900,c_limit/v1/place.jpg');
});
test("uses geographic distance in km and the destination's actual pin", () => {
  assert.equal(distanceKm(homestay, homestay), 0);
  assert.ok(Math.abs(distanceKm({ lat: 0, lng: 0 }, { lat: 0, lng: 1 }) - 111.195) < 0.01);
  assert.equal(directionsUrl(homestay), 'https://www.google.com/maps/dir/?api=1&destination=10.228855,106.3675106');
});
