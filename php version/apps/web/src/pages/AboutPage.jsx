import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { ShieldCheck, Target, Globe2, Users } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

const AboutPage = () => {
  const values = [
    {
      title: "Reliability",
      description: "We deliver on our promises, ensuring your cargo reaches its destination safely and on schedule, every single time.",
      icon: <ShieldCheck className="w-8 h-8 text-white" />,
      color: "bg-primary"
    },
    {
      title: "Global Reach",
      description: "Our expansive network spans across continents, breaking down borders to provide truly international logistics solutions.",
      icon: <Globe2 className="w-8 h-8 text-white" />,
      color: "bg-secondary"
    },
    {
      title: "Transparency",
      description: "With advanced tracking and open communication, you are never in the dark about the status of your supply chain.",
      icon: <Target className="w-8 h-8 text-white" />,
      color: "bg-accent"
    },
    {
      title: "Client-Centric",
      description: "Your business goals are ours. We tailor our logistics strategies to fit your specific operational needs and growth targets.",
      icon: <Users className="w-8 h-8 text-white" />,
      color: "bg-primary"
    }
  ];

  return (
    <>
      <Helmet>
        <title>About Us | STC Logistics</title>
        <meta name="description" content="Learn about STC Logistics, our mission, history, and the values that drive our global container tracking and supply chain solutions." />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-white">
        <Header />

        <main className="flex-1 pt-24 pb-16">
          {/* Hero Section */}
          <section className="relative py-28 overflow-hidden bg-white">
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
               <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-primary/40 blur-3xl mix-blend-multiply"></div>
               <div className="absolute top-[10%] -right-[10%] w-[60%] h-[60%] rounded-full bg-secondary/40 blur-3xl mix-blend-multiply"></div>
            </div>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center max-w-4xl mx-auto"
              >
                <img 
                  src="https://horizons-cdn.hostinger.com/078706aa-f5fb-4d67-9332-07e46e25168e/97b99b971ffa966046adf32c498310a4.png" 
                  alt="STC Logistics" 
                  className="h-20 md:h-24 w-auto mx-auto mb-10 object-contain brightness-0"
                />
                <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 tracking-tight">
                  Driving Global Trade <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Forward</span>
                </h1>
                <p className="text-xl md:text-2xl text-slate-600 font-medium leading-relaxed max-w-3xl mx-auto">
                  At STC Logistics, we bridge the gap between complex supply chains and seamless execution. Discover the vision and history behind our world-class service.
                </p>
              </motion.div>
            </div>
          </section>

          {/* Mission & History Zig-Zag */}
          <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-32">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                <div className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary font-bold tracking-widest uppercase text-sm mb-6">Our Mission</div>
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">To simplify the complexities of international logistics.</h2>
                <p className="text-xl text-slate-600 font-medium leading-relaxed mb-6">
                  We believe that businesses should focus on growth, not get bogged down by shipping logistics. Our mission is to provide end-to-end supply chain transparency, reliable freight forwarding, and strategic procurement services.
                </p>
                <p className="text-xl text-slate-600 font-medium leading-relaxed border-l-4 border-secondary pl-6">
                  By leveraging technology and deep industry expertise, we empower our clients to make informed decisions and move cargo with total confidence.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className="relative h-[450px] rounded-[2rem] overflow-hidden shadow-2xl shadow-secondary/20 group"
              >
                <img 
                  src="https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?auto=format&fit=crop&q=80&w=1200" 
                  alt="Cargo ship crossing the ocean" 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-secondary/40 to-transparent mix-blend-overlay" />
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className="order-2 md:order-1 relative h-[450px] rounded-[2rem] overflow-hidden shadow-2xl shadow-primary/20 group"
              >
                <img 
                  src="https://images.unsplash.com/photo-1586528116311-ad8ed7fc51f7?auto=format&fit=crop&q=80&w=1200" 
                  alt="Busy commercial port with stacked shipping containers" 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/40 to-transparent mix-blend-overlay" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className="order-1 md:order-2"
              >
                <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-bold tracking-widest uppercase text-sm mb-6">Our History</div>
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">Built on a foundation of trust and performance.</h2>
                <p className="text-xl text-slate-600 font-medium leading-relaxed mb-6">
                  Headquartered in Guangzhou, the core of China's export ecosystem, STC Logistics began with a simple goal: provide better service than legacy forwarders. Over the years, we've expanded our footprint globally.
                </p>
                <p className="text-xl text-slate-600 font-medium leading-relaxed">
                  Today, we manage thousands of TEUs annually, integrate directly with top ocean carriers, and act as the vital procurement and shipping arm for enterprises worldwide.
                </p>
              </motion.div>
            </div>
          </section>

          {/* Core Values Bento */}
          <section className="py-32 bg-slate-50 relative z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-20">
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">Our Core Values</h2>
                <p className="text-xl text-slate-600 font-medium max-w-2xl mx-auto">
                  The principles that guide our daily operations and long-term strategy.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {values.map((value, index) => (
                  <motion.div
                    key={value.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white p-10 rounded-[2rem] shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
                  >
                    <div className={`w-16 h-16 rounded-2xl ${value.color} flex items-center justify-center mb-8 shadow-lg shadow-${value.color}/30`}>
                      {value.icon}
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-4">{value.title}</h3>
                    <p className="text-slate-600 font-medium leading-relaxed">
                      {value.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default AboutPage;