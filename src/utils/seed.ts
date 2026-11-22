import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { Service } from "../models/Service";

export const seedInitialData = async (): Promise<void> => {
  try {
    const existingAdmin = await User.findOne({ email: "admin@salonbook.com" });
    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("Admin123!", salt);

      await User.create({
        name: "Elena Vance (Salon Director)",
        email: "admin@salonbook.com",
        password: hashedPassword,
        role: "admin",
        image:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
        phone: "+1 (555) 234-5678",
        address: "742 Evergreen Terrace, Suite 101, New York, NY",
        isBlocked: false,
      });
      console.log("[Seed] Default admin account created: admin@salonbook.com / Admin123!");
    }

    const existingCustomer = await User.findOne({ email: "demo@example.com" });
    if (!existingCustomer) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("Customer123!", salt);

      await User.create({
        name: "Demo Customer",
        email: "demo@example.com",
        password: hashedPassword,
        role: "customer",
        image:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
        phone: "+1 (555) 892-1204",
        address: "124 Magnolia Blvd, Brooklyn, NY",
        isBlocked: false,
      });
      console.log("[Seed] Demo customer created: demo@example.com / Customer123!");
    }

    const serviceCount = await Service.countDocuments();
    if (serviceCount === 0) {
      const initialServices = [
        {
          serviceName: "Signature Master Haircut & Blowdry",
          category: "Haircut & Styling",
          description:
            "Complete personal consultation followed by a luxury botanical shampoo, precision shear cut, scalp tension massage, and signature blowout finish.",
          price: 65,
          duration: 60,
          image:
            "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1000&q=80",
          status: "active",
          featured: true,
        },
        {
          serviceName: "Artisan Balayage & Gloss Glaze",
          category: "Hair Coloring",
          description:
            "Hand-painted sun-kissed ribbons tailored to your bone structure and skin tone. Finished with an organic amino-acid gloss that locks in luminous multidimensional radiance.",
          price: 180,
          duration: 150,
          image:
            "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=80",
          status: "active",
          featured: true,
        },
        {
          serviceName: "Diamond Glow Hydra-Derm Facial",
          category: "Facial & Skincare",
          description:
            "Triple-action hydro-dermabrasion infusing patented hyaluronic peptides, antioxidant vitamins, and LED light stimulation for instantly plumper, dewy skin.",
          price: 120,
          duration: 75,
          image:
            "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1000&q=80",
          status: "active",
          featured: true,
        },
        {
          serviceName: "Keratin Silk Infusion Therapy",
          category: "Hair Treatment",
          description:
            "Formaldehyde-free smoothing treatment that restores cellular lipids, eliminates 95% of frizz, and seals in reflective mirror shine for up to 5 months.",
          price: 210,
          duration: 120,
          image:
            "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=1000&q=80",
          status: "active",
          featured: true,
        },
        {
          serviceName: "Volcanic Hot Stone & Deep Tissue Ritual",
          category: "Spa & Massage",
          description:
            "Heated basalt river stones combined with therapeutic aromatherapeutic oils and targeted myofascial pressure to melt stubborn muscular knots.",
          price: 140,
          duration: 90,
          image:
            "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1000&q=80",
          status: "active",
          featured: true,
        },
        {
          serviceName: "Russian Gel Architecture Manicure",
          category: "Manicure & Pedicure",
          description:
            "Micro-precision dry cuticle alignment, structural rubber-base apex reinforcement, and chip-proof salon lacquer lasting over 4 weeks.",
          price: 75,
          duration: 75,
          image:
            "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=1000&q=80",
          status: "active",
          featured: true,
        },
        {
          serviceName: "Red Carpet Couture Makeup",
          category: "Makeup",
          description:
            "Long-wear silicone-airbrush base, customized faux mink individual lashes, soft sculpt contouring, and luminous lip lacquer for your gala or special occasion.",
          price: 110,
          duration: 60,
          image:
            "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1000&q=80",
          status: "active",
          featured: false,
        },
        {
          serviceName: "Botanical Scalp Detox & High Frequency",
          category: "Hair Treatment",
          description:
            "Deep exfoliating tea tree scrub, ozone steam treatment, and violet high-frequency argon wand therapy to stimulate dormant follicles and clarify oiliness.",
          price: 85,
          duration: 45,
          image:
            "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=1000&q=80",
          status: "active",
          featured: false,
        },
        {
          serviceName: "Executive Grooming & Beard Sculpt",
          category: "Haircut & Styling",
          description:
            "Tailored fade or classic cut, hot towel eucalyptus lather, straight-razor cheek line contouring, and rich argan conditioning oil massage.",
          price: 55,
          duration: 45,
          image:
            "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1000&q=80",
          status: "active",
          featured: false,
        },
        {
          serviceName: "Hollywood Glam Waves & Updo Styling",
          category: "Haircut & Styling",
          description:
            "Sculpted vintage S-waves, intricate red-carpet braided crowns, or sleek couture chignons set with heat-shielding botanical mist.",
          price: 95,
          duration: 75,
          image:
            "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1000&q=80",
          status: "active",
          featured: false,
        },
        {
          serviceName: "Curated Textured Pixie & Precision Cut",
          category: "Haircut & Styling",
          description:
            "Dynamic edge contouring, razor texturizing, and weight removal designed to flatter facial angles with effortless low-maintenance movement.",
          price: 70,
          duration: 50,
          image:
            "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=1000&q=80",
          status: "active",
          featured: false,
        },
        {
          serviceName: "Platinum Blonde Ice & Bond Building Lightening",
          category: "Hair Coloring",
          description:
            "Multi-stage virgin blonde lift with plex cellular shielding, icy violet neutralizing toner, and a deep ceramide restoration bath.",
          price: 220,
          duration: 180,
          image:
            "https://images.unsplash.com/photo-1605497788044-5a32c7078486?auto=format&fit=crop&w=1000&q=80",
          status: "active",
          featured: true,
        },
        {
          serviceName: "Rich Chestnut Ombre & Root Melt",
          category: "Hair Coloring",
          description:
            "Gradual seamless gradient blending espresso roots into warm hazelnut and caramel ribbons with glossy UV-resistant shine.",
          price: 160,
          duration: 135,
          image:
            "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=1000&q=80",
          status: "active",
          featured: false,
        },
        {
          serviceName: "Sun-Kissed Dimensional Highlights & Toner",
          category: "Hair Coloring",
          description:
            "Micro-fine foil placement around crown and framing zones, imparting shimmering golden warmth and natural sunlight reflections.",
          price: 145,
          duration: 120,
          image:
            "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1000&q=80",
          status: "active",
          featured: false,
        },
        {
          serviceName: "Caviar & Peptide Cellular Moisture Injection",
          category: "Hair Treatment",
          description:
            "Intense deep-cortex quenching treatment enriched with French black caviar extract and bio-peptides for brittle, color-treated locks.",
          price: 130,
          duration: 60,
          image:
            "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=1000&q=80",
          status: "active",
          featured: false,
        },
        {
          serviceName: "Olaplex Intensive Molecular Bond Restorative Repair",
          category: "Hair Treatment",
          description:
            "Patented bis-aminopropyl diglycol dimaleate technology repairing broken disulfide sulfur bonds for chemically compromised strands.",
          price: 95,
          duration: 50,
          image:
            "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=1000&q=80",
          status: "active",
          featured: true,
        },
        {
          serviceName: "24K Imperial Gold Collagen Firming Facial",
          category: "Facial & Skincare",
          description:
            "Pure 24-karat bioactive gold leaf application, peptide micro-current contouring, and cold cryo-globes to lock in immediate lifting firmness.",
          price: 175,
          duration: 90,
          image:
            "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1000&q=80",
          status: "active",
          featured: true,
        },
        {
          serviceName: "Clinical Vitamin C Radiance & Micro-Peel",
          category: "Facial & Skincare",
          description:
            "Stabilized 20% L-ascorbic acid peel with gentle lactic exfoliation to fade hyperpigmentation and reveal a glass-skin glow.",
          price: 110,
          duration: 60,
          image:
            "https://images.unsplash.com/photo-1576426863848-c21f53c60b19?auto=format&fit=crop&w=1000&q=80",
          status: "active",
          featured: false,
        },
        {
          serviceName: "Organic Calming Botanical Soothe & Hydrate",
          category: "Facial & Skincare",
          description:
            "Chamomile, centella asiatica, and cucumber cooling compresses designed to calm sensitive, reactive, or rosacea-prone complexions.",
          price: 90,
          duration: 50,
          image:
            "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=1000&q=80",
          status: "active",
          featured: false,
        },
        {
          serviceName: "Bridal Radiance Royal Glam Package",
          category: "Makeup",
          description:
            "Waterproof HD airbrush veil, individual Siberian silk lashes, custom lip contouring, and 16-hour sweat-proof bridal setting technique.",
          price: 195,
          duration: 105,
          image:
            "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=1000&q=80",
          status: "active",
          featured: true,
        },
        {
          serviceName: "Soft Dewy Clean-Girl Everyday Makeup",
          category: "Makeup",
          description:
            "Lightweight luminous skin tint, brushed laminated soap brows, cream berry blush flush, and glassy nourishing lip glaze.",
          price: 75,
          duration: 45,
          image:
            "https://images.unsplash.com/photo-1503236823255-94609f598e71?auto=format&fit=crop&w=1000&q=80",
          status: "active",
          featured: false,
        },
        {
          serviceName: "Editorial Smokey Evening Glam & Lash Couture",
          category: "Makeup",
          description:
            "Velvety blackened-bronze smoked eye shadow, precision winged kohl liner, and dimensional cheek chiseling for gala events.",
          price: 125,
          duration: 60,
          image:
            "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=80",
          status: "active",
          featured: false,
        },
        {
          serviceName: "Luxury Rose Petal & Milk Spa Pedicure",
          category: "Manicure & Pedicure",
          description:
            "Warm organic whole milk and fresh rose petal foot bath, Himalayan pink salt scrub, warm volcanic basalt foot massage, and gel polish.",
          price: 85,
          duration: 60,
          image:
            "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=1000&q=80",
          status: "active",
          featured: true,
        },
        {
          serviceName: "Sculpted Polygel Nail Extensions & 3D Art",
          category: "Manicure & Pedicure",
          description:
            "Featherweight hybrid acrylic-gel extensions with handcrafted French tips, chrome cat-eye glaze, or bespoke Swarovski crystal accents.",
          price: 115,
          duration: 90,
          image:
            "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1000&q=80",
          status: "active",
          featured: false,
        },
        {
          serviceName: "Organic Citrus Paraffin Treatment & Nail Renewal",
          category: "Manicure & Pedicure",
          description:
            "Warm sweet orange essential oil paraffin wax wrap to deeply condition dry cuticles, finished with nail shaping and high-gloss buffing.",
          price: 65,
          duration: 50,
          image:
            "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=1000&q=80",
          status: "active",
          featured: false,
        },
        {
          serviceName: "Balinese Herbal Aromatherapy Full Body Massage",
          category: "Spa & Massage",
          description:
            "Gentle rhythmic stretching, long palm glides, and warmed organic lemongrass-clove oils to revitalize circulation and energy meridians.",
          price: 125,
          duration: 75,
          image:
            "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=1000&q=80",
          status: "active",
          featured: true,
        },
        {
          serviceName: "Swedish Lymphatic Drainage & Tension Relief",
          category: "Spa & Massage",
          description:
            "Feather-light directional stroke techniques aimed at reducing water retention, enhancing systemic detox, and eliminating body fatigue.",
          price: 115,
          duration: 60,
          image:
            "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=1000&q=80",
          status: "active",
          featured: false,
        },
        {
          serviceName: "Moroccan Argan Scalp & Upper Body Reset",
          category: "Spa & Massage",
          description:
            "Warmed pure cold-pressed argan oil drizzled onto crown points, followed by a deeply relaxing neck, trapezius, and shoulder acupressure.",
          price: 95,
          duration: 45,
          image:
            "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1000&q=80",
          status: "active",
          featured: false,
        },
      ];

      await Service.insertMany(initialServices);
      console.log(`[Seed] Populated ${initialServices.length} default salon services.`);
    }
  } catch (error) {
    console.error("[Seed] Error seeding initial data:", error);
  }
};
