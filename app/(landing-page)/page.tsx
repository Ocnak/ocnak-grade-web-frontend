import HeroSection from "./hero-section";

export default function LandingPage() {
  return (
    <>
      <section className="bg-gray-100 antialiased">
        <div className="mx-auto mt-32 grid w-full max-w-255 px-3 md:px-0">
          <HeroSection />
        </div>
      </section>
    </>
  );
}
