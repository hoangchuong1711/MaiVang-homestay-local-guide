"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main className="loading-screen"><h1>Let’s try that again.</h1><p>The guide could not open. Please check your connection.</p><button className="primary-button" onClick={reset}>Try again</button></main>;
}
