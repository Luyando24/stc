import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const testimonials = [
  {
    id: 7,
    text: "I especially appreciated their help in managing supplier payments and factory inspection, which saved me so much time and hassle. Highly recommend their services!",
    author: "Muhammed",
    role: "Client",
    company: "South Africa",
    image: "https://horizons-cdn.hostinger.com/078706aa-f5fb-4d67-9332-07e46e25168e/66bf4f2e1d17a6eb72e55c3f3b0348ee.png",
    accent: "primary"
  },
  {
    id: 1,
    text: "STC Logistics transformed our supply chain. Reliable, professional, and always on time.",
    author: "John Chen",
    role: "Import Manager",
    company: "TechCorp Asia",
    accent: "secondary"
  },
  {
    id: 2,
    text: "Working with STC has been seamless. Their tracking system is the best in the industry.",
    author: "Maria Santos",
    role: "Operations Director",
    company: "Global Trade Solutions",
    accent: "accent"
  },
  {
    id: 3,
    text: "Exceptional service and competitive pricing. Highly recommended for international logistics.",
    author: "Ahmed Al-Rashid",
    role: "Procurement Manager",
    company: "Middle East Distributors",
    accent: "primary"
  },
  {
    id: 4,
    text: "STC's team is responsive and knowledgeable. They handle our complex shipments with ease.",
    author: "Lisa Wang",
    role: "Supply Chain Manager",
    company: "Fashion Imports Ltd",
    accent: "secondary"
  },
  {
    id: 5,
    text: "Best logistics partner we've had. Their equipment tracking is accurate and reliable.",
    author: "David Kumar",
    role: "Warehouse Manager",
    company: "Electronics Distribution",
    accent: "accent"
  },
  {
    id: 6,
    text: "Professional, trustworthy, and efficient. STC Logistics is our go-to partner.",
    author: "Sophie Martin",
    role: "Shipping Coordinator",
    company: "European Trade Group",
    accent: "primary"
  }
];

const TestimonialCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);

  const slideNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  }, []);

  const slidePrev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(slideNext, 7000);
    return () => clearInterval(timer);
  }, [isPaused, slideNext]);

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
      scale: 0.95
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    },
    exit: (direction) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.4, ease: "easeIn" }
    })
  };

  const getAccentColor = (accent) => {
    if (accent === 'secondary') return 'text-secondary bg-secondary/10 border-secondary';
    if (accent === 'accent') return 'text-accent bg-accent/10 border-accent';
    return 'text-primary bg-primary/10 border-primary';
  };

  const activeTestimonial = testimonials[currentIndex];
  const accentTheme = getAccentColor(activeTestimonial.accent);

  return (
    <div className="py-24 bg-card relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-6">Partner Success Stories</h2>
          <p className="text-muted-foreground text-xl font-medium max-w-2xl mx-auto">
            See how STC Logistics accelerates growth and delivers peace of mind worldwide.
          </p>
        </div>

        <div 
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="relative min-h-[380px] md:min-h-[320px] w-full flex items-center justify-center">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                className="absolute w-full max-w-4xl mx-auto"
              >
                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-border relative overflow-hidden group">
                  {/* Subtle color band at top */}
                  <div className={`absolute top-0 left-0 w-full h-2 ${activeTestimonial.accent === 'primary' ? 'bg-primary' : activeTestimonial.accent === 'secondary' ? 'bg-secondary' : 'bg-accent'}`}></div>
                  
                  <Quote className={`absolute top-10 right-10 w-16 h-16 opacity-10 ${activeTestimonial.accent === 'primary' ? 'text-primary' : activeTestimonial.accent === 'secondary' ? 'text-secondary' : 'text-accent'} rotate-180 transition-transform group-hover:scale-110 duration-500`} />
                  
                  <blockquote className="text-2xl md:text-3xl font-bold text-foreground mb-10 leading-relaxed text-balance pr-12">
                    "{activeTestimonial.text}"
                  </blockquote>
                  
                  <div className="flex items-center gap-5">
                    {activeTestimonial.image ? (
                      <img 
                        src={activeTestimonial.image} 
                        alt={activeTestimonial.author}
                        className={`w-16 h-16 rounded-full object-cover border-4 shadow-md ${activeTestimonial.accent === 'primary' ? 'border-primary/20' : activeTestimonial.accent === 'secondary' ? 'border-secondary/20' : 'border-accent/20'}`}
                      />
                    ) : (
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center font-extrabold text-2xl border-2 ${accentTheme}`}>
                        {activeTestimonial.author.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="font-extrabold text-lg text-foreground">
                        {activeTestimonial.author}
                      </div>
                      <div className="text-base font-medium text-muted-foreground">
                        {activeTestimonial.role}, <span className={activeTestimonial.accent === 'primary' ? 'text-primary' : activeTestimonial.accent === 'secondary' ? 'text-secondary' : 'text-accent'}>{activeTestimonial.company}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-8 mt-12">
            <button 
              onClick={slidePrev}
              className="w-14 h-14 rounded-full bg-white shadow-md flex items-center justify-center text-foreground hover:bg-primary hover:text-white transition-all active:scale-95"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-7 h-7" />
            </button>
            
            <div className="flex gap-3">
              {testimonials.map((test, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setDirection(idx > currentIndex ? 1 : -1);
                    setCurrentIndex(idx);
                  }}
                  className={`transition-all duration-500 rounded-full h-3 ${
                    idx === currentIndex 
                      ? `w-10 ${test.accent === 'primary' ? 'bg-primary' : test.accent === 'secondary' ? 'bg-secondary' : 'bg-accent'}` 
                      : 'w-3 bg-gray-200 hover:bg-gray-300'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            <button 
              onClick={slideNext}
              className="w-14 h-14 rounded-full bg-white shadow-md flex items-center justify-center text-foreground hover:bg-primary hover:text-white transition-all active:scale-95"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-7 h-7" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCarousel;