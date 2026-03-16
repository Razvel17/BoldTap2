import Navigation from "@/components/Navigation";
import ScrollProgress from "@/components/ScrollProgress";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Connecting from "@/components/Connecting";
import Impression from "@/components/Impression";
import Customization from "@/components/Customization";
import Products from "@/components/Products";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <ScrollProgress />
      <Navigation />
      <Hero />
      <Features />
      <Connecting />
      <Impression />
      <Customization />
      <Products />
      <FAQ />
      <Footer />
    </main>
  );
}
