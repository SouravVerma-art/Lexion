require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const wordRoutes = require('./routes/words');
const Word = require('./models/Word');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/words', wordRoutes);

// Database Connection & Seeding
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Clear and re-seed or seed if empty
    // Let's seed if empty to ensure initial database setup
    const count = await Word.countDocuments();
    if (count === 0) {
      console.log('Seeding database with default vocabulary...');
      await Word.insertMany([
        {
          word: 'Ephemeral',
          partOfSpeech: 'adjective',
          definition: 'Lasting for a very short time; transient. Often used to describe things found in nature, like certain flowers or insects.',
          difficulty: 'B2',
          status: 'learning',
          starred: false,
          pronunciation: '/ɪˈfem.ər.əl/',
          frequency: 3,
          context: 'Lasting for a remarkably brief time.',
          rootOrigin: 'From Greek ephemeros, meaning "lasting only a day".',
          wordFamily: [
            { word: 'Ephemera', partOfSpeech: 'NOUN' },
            { word: 'Ephemerally', partOfSpeech: 'ADVERB' }
          ],
          collocations: ['ephemeral beauty', 'ephemeral nature', 'highly ephemeral'],
          synonyms: ['transient', 'fleeting', 'temporary', 'evanescent'],
          antonyms: ['permanent', 'eternal', 'lasting', 'perpetual'],
          examples: [
            'The beauty of cherry blossoms is ephemeral, lasting only a few days.',
            'Fame in the digital age can be highly ephemeral.'
          ],
          imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBUFtjeC2wXs6-_9Xg1TbZSM_ImcOpLzmo5tE4MvxOkDyindsmARURirDuz9NuK2Zj39Nq_Mmci1Z5KsB3INOMUBEisBY9kj82bKQM-HL-i1Sd-AUhJ38MDLsPmN8NRrYyF1s-VnJBwsATIP-z8Xl_fRbRdyrVtW5kHAvxxKIAbo4eKVDdC4fgG1hr9HwoJefHdEnsURWmR26Jbv_wzAkC5-ja8UXvDHPKPbhbcjQZkpynqQEl2IOMEA3ngMTBDD-5PrUAYDk3-FEGl',
          memoryTrick: '"Fame is ephemeral, like an E-Mail that gets deleted quickly."',
          retentionStrength: 40,
          revisionSchedule: [
            { label: 'Day 1', checked: true },
            { label: 'Day 3', checked: false },
            { label: 'Day 7 (Today)', checked: false },
            { label: 'Day 15', checked: false }
          ],
          commonMistake: 'Do not confuse with "effeminate" (having characteristics regarded as typical of a woman).'
        },
        {
          word: 'Ubiquitous',
          partOfSpeech: 'adjective',
          definition: 'Present, appearing, or found everywhere.',
          difficulty: 'C1',
          status: 'mastered',
          starred: true,
          pronunciation: '/juːˈbɪk.wɪ.təs/',
          frequency: 5,
          context: 'Seems to be everywhere at once.',
          rootOrigin: 'From Latin ubique meaning "everywhere". Entered English in the mid 19th century, originally referring to the divine presence.',
          wordFamily: [
            { word: 'Ubiquity', partOfSpeech: 'NOUN' },
            { word: 'Ubiquitously', partOfSpeech: 'ADVERB' }
          ],
          collocations: ['ubiquitous computing', 'ubiquitous presence', 'increasingly ubiquitous', 'virtually ubiquitous'],
          synonyms: ['omnipresent', 'universal', 'pervasive', 'all-over'],
          antonyms: ['rare', 'scarce', 'localized', 'infrequent'],
          examples: [
            'Smartphones have become ubiquitous in modern society, carried by nearly everyone.',
            'His ubiquitous influence could be felt in every department of the company.'
          ],
          imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBUFtjeC2wXs6-_9Xg1TbZSM_ImcOpLzmo5tE4MvxOkDyindsmARURirDuz9NuK2Zj39Nq_Mmci1Z5KsB3INOMUBEisBY9kj82bKQM-HL-i1Sd-AUhJ38MDLsPmN8NRrYyF1s-VnJBwsATIP-z8Xl_fRbRdyrVtW5kHAvxxKIAbo4eKVDdC4fgG1hr9HwoJefHdEnsURWmR26Jbv_wzAkC5-ja8UXvDHPKPbhbcjQZkpynqQEl2IOMEA3ngMTBDD-5PrUAYDk3-FEGl',
          memoryTrick: '"U-B-quitous? No, You Be Everywhere."',
          retentionStrength: 60,
          revisionSchedule: [
            { label: 'Day 1', checked: true },
            { label: 'Day 3', checked: true },
            { label: 'Day 7 (Today)', checked: false },
            { label: 'Day 15', checked: false }
          ],
          commonMistake: "Don't confuse with omniscient (knowing everything). Ubiquitous strictly refers to location/presence."
        },
        {
          word: 'Mitigate',
          partOfSpeech: 'verb',
          definition: 'Make less severe, serious, or painful. Lessen the gravity of (an offense or mistake).',
          difficulty: 'B2',
          status: 'review',
          starred: false,
          pronunciation: '/ˈmɪt.ɪ.ɡeɪt/',
          frequency: 4,
          context: 'Lessen the impact or severity of something negative.',
          rootOrigin: 'From Latin mitigare, meaning "to soften, make mild".',
          wordFamily: [
            { word: 'Mitigation', partOfSpeech: 'NOUN' },
            { word: 'Mitigating', partOfSpeech: 'ADJECTIVE' }
          ],
          collocations: ['mitigate damage', 'mitigate risk', 'mitigate effects'],
          synonyms: ['alleviate', 'reduce', 'diminish', 'soften'],
          antonyms: ['aggravate', 'intensify', 'exacerbate', 'worsen'],
          examples: [
            'Drainage schemes have helped to mitigate the risk of flooding.',
            'We need to take measures to mitigate the environmental impact of the factory.'
          ],
          imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBUFtjeC2wXs6-_9Xg1TbZSM_ImcOpLzmo5tE4MvxOkDyindsmARURirDuz9NuK2Zj39Nq_Mmci1Z5KsB3INOMUBEisBY9kj82bKQM-HL-i1Sd-AUhJ38MDLsPmN8NRrYyF1s-VnJBwsATIP-z8Xl_fRbRdyrVtW5kHAvxxKIAbo4eKVDdC4fgG1hr9HwoJefHdEnsURWmR26Jbv_wzAkC5-ja8UXvDHPKPbhbcjQZkpynqQEl2IOMEA3ngMTBDD-5PrUAYDk3-FEGl',
          memoryTrick: '"Think of a Gate that blocks the flood, mitigating the water damage."',
          retentionStrength: 30,
          revisionSchedule: [
            { label: 'Day 1', checked: false },
            { label: 'Day 3', checked: false },
            { label: 'Day 7 (Today)', checked: false },
            { label: 'Day 15', checked: false }
          ],
          commonMistake: 'Do not confuse with "militate" (to operate or work against, e.g. "militate against success").'
        }
      ]);
      console.log('Database seeded with rich parameters!');
    }
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
  });

// Root Endpoint
app.get('/', (req, res) => {
  res.send('Lexicon API is running');
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
