const fs = require('fs');
let code = fs.readFileSync('AdminPage.tsx', 'utf-8');

const correctBlock = `          <div>
            <label className="block text-white font-bold mb-2">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold focus:outline-none"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-white font-bold mb-2">Price Text *</label>
            <input
              type="text"
              value={formData.price_text}
              onChange={(e) => setFormData({ ...formData, price_text: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold focus:outline-none"
              required
            />
          </div>
          <div className="flex items-center gap-3 mt-4">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-5 h-5"
            />
            <label className="text-white font-bold">Active (visible to visitors)</label>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full gold-gradient text-black font-black py-3 rounded-full hover:shadow-[0_0_30px_rgba(229,192,123,0.6)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'SAVING...' : editingOffer ? 'Update Offer' : 'Create Offer'}
          </button>
        </form>
      )}`;

// We need to find where the first "Description *" label is, and cut out everything up to "        </form>\n      )}"

const startIdx = code.indexOf('<div>\\n            <label className="block text-white font-bold mb-2">Description *</label>');
const endIdx = code.indexOf('        </form>\\n      )}') + '        </form>\\n      )}'.length;

if (startIdx !== -1 && endIdx !== -1) {
    code = code.substring(0, startIdx) + correctBlock + code.substring(endIdx);
    fs.writeFileSync('AdminPage.tsx', code);
    console.log('Fixed syntax error!');
} else {
    // Let's just fix it by matching the exact incorrect structure if we can't find it.
    console.log('Could not find boundaries, trying regex');
    
    code = code.replace(/<div>\s*<label className="block text-white font-bold mb-2">Description \*<\/label>[\s\S]*?<\/form>\s*\)}/m, correctBlock);
    fs.writeFileSync('AdminPage.tsx', code);
}
