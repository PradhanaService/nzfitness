import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar, Footer, Transformations, SiteImagesContext } from './App';
import { supabase } from './supabaseClient';

const TransformationsPage: React.FC = () => {
  const [siteImages, setSiteImages] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchImages = async () => {
      const { data } = await supabase.from('section_images').select('section_key, image_data');
      if (data) {
        const imageMap: Record<string, string> = {};
        data.forEach((img: any) => {
          imageMap[img.section_key] = img.image_data;
        });
        setSiteImages(imageMap);
      }
    };
    fetchImages();
  }, []);

  return (
    <SiteImagesContext.Provider value={siteImages}>
      <div className="min-h-screen bg-[#050505] text-white flex flex-col">
        <Navbar onJoinNow={() => window.location.href = '/#contact'} />
        
        <main className="flex-1 pt-24 pb-[100px] md:pb-0">
          <div className="container mx-auto px-4 md:px-6 pt-8 relative z-20">
            <button 
              onClick={() => navigate('/')} 
              className="group inline-flex items-center gap-2.5 rounded-full border border-gold/30 bg-black/40 px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] text-gold backdrop-blur-md transition-all duration-300 hover:border-gold hover:bg-gold hover:text-black hover:shadow-[0_0_15px_rgba(201,168,76,0.4)]"
              aria-label="Back to home"
            >
              <span className="transition-transform duration-300 group-hover:-translate-x-1 text-sm font-black">←</span>
              <span>Back to Home</span>
            </button>
          </div>
          
          <div className="mt-4">
            <Transformations />
          </div>
        </main>

        <Footer />
      </div>
    </SiteImagesContext.Provider>
  );
};

export default TransformationsPage;
