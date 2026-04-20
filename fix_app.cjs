const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

// 1. Fix Nav Links
code = code.replace(/<a href="#offer" className="hover:text-gold transition-colors">Offers<\/a>/g, '<a href="#offers" className="hover:text-gold transition-colors">Offers</a>');
code = code.replace(/<a href="\/portal" className="hover:text-gold transition-colors">Membership<\/a>/g, '<a href="#membership" className="hover:text-gold transition-colors">Membership</a>');

code = code.replace(/<a href="#offer" onClick={closeMenu} className="text-lg font-bold text-white hover:text-gold transition-colors uppercase tracking-wide">Offers<\/a>/g, '<a href="#offers" onClick={closeMenu} className="text-lg font-bold text-white hover:text-gold transition-colors uppercase tracking-wide">Offers</a>');
code = code.replace(/<a href="\/portal" onClick={closeMenu} className="text-lg font-bold text-white hover:text-gold transition-colors uppercase tracking-wide">Membership<\/a>/g, '<a href="#membership" onClick={closeMenu} className="text-lg font-bold text-white hover:text-gold transition-colors uppercase tracking-wide">Membership</a>');

// 2. Add id to SpecialOffers section
code = code.replace(/<section className="py-16 md:py-24 relative overflow-hidden">/, '<section id="offers" className="py-16 md:py-24 relative overflow-hidden">');

// 3. Update SpecialOffers to only show ONE shuffled offer per day
const oldFetch = `        if (error) throw error;
        if (data) setOffers(data);`;
const newFetch = `        if (error) throw error;
        if (data && data.length > 0) {
          const dayOfYear = Math.floor(Date.now() / 86400000);
          const dailyIndex = dayOfYear % data.length;
          setOffers([data[dailyIndex]]);
        }`;
code = code.replace(oldFetch, newFetch);

// 4. Remove OfferPortal
// OfferPortal starts from `const OfferPortal: React.FC = () => {` and ends before `const App: React.FC = () => {`
const offerPortalRegex = /const OfferPortal: React\.FC = \(\) => {[\s\S]*?(?=const App: React\.FC = \(\) => {)/;
code = code.replace(offerPortalRegex, '');

// 5. Remove <OfferPortal /> from App return
code = code.replace(/<OfferPortal \/>/, '');

fs.writeFileSync('App.tsx', code);
console.log("App properly fixed");
