import { DiagnosisResult } from "./types";

export interface CropSample {
  id: string;
  nameEn: string;
  nameSw: string;
  diseaseEn: string;
  diseaseSw: string;
  notesEn: string;
  notesSw: string;
  imageUrl: string;
  diagnosisEn: DiagnosisResult;
  diagnosisSw: DiagnosisResult;
}

export const cropSamples: CropSample[] = [
  {
    id: "tomato_blight",
    nameEn: "Tomato / Nyanya",
    nameSw: "Nyanya (Tomato)",
    diseaseEn: "Late Blight",
    diseaseSw: "Chule ya Nyanya (Late Blight)",
    notesEn: "Dark, water-soaked spots appeared on leaves after continuous rainfall. White mold is visible underneath.",
    notesSw: "Madoa ya giza yaliyolowa maji yalionekana kwenye majani baada ya mvua kubwa. Kuvu nyeupe inaonekana chini ya majani.",
    imageUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' fill='%2322c55e'/><path d='M20,40 Q50,10 80,40 Q50,70 20,40' fill='%2315803d'/><circle cx='40' cy='35' r='8' fill='%2378350f' opacity='0.8'/><circle cx='60' cy='45' r='10' fill='%2378350f' opacity='0.8'/><circle cx='48' cy='42' r='6' fill='%2378350f' opacity='0.7'/><circle cx='55' cy='30' r='5' fill='%23eaeaea' opacity='0.6'/><circle cx='35' cy='42' r='4' fill='%23eaeaea' opacity='0.6'/></svg>",
    diagnosisEn: {
      plantType: "Tomato",
      diseaseName: "Tomato Late Blight (Phytophthora infestans)",
      confidence: 96,
      severity: "High",
      description: "A devastating fungal-like disease that affects tomatoes and potatoes. It thrives in cool, wet weather and can destroy an entire crop within days if left unchecked.",
      symptoms: [
        "Dark, water-soaked lesions on leaves turning brown-black.",
        "White, fuzzy fungal growth on the undersides of leaves during humid conditions.",
        "Stem lesions turning dark brown, causing leaf wilt and death.",
        "Hard, greasy brown patches on tomato fruits rendering them inedible."
      ],
      treatment: {
        immediateActions: [
          "Uproot and destroy heavily infected tomato plants immediately. Do not compost them.",
          "Prune lower leaves to increase air circulation and reduce dampness near the soil.",
          "Avoid overhead watering; water strictly at the base of the plant."
        ],
        organicRemedies: [
          "Spray a baking soda solution: Mix 1 tablespoon of baking soda and 2.5 tablespoons of horticultural oil in 1 gallon of water.",
          "Apply copper fungicide sprays, which are approved for organic farming when used responsibly."
        ],
        chemicalOptions: [
          "Apply preventative fungicides containing Mancozeb (e.g., Oshothane, Dithane M-45).",
          "For active infections, use systemic fungicides containing Metalaxyl + Mancozeb (e.g., Ridomil Gold) at a rate of 40g per 20L of water, repeated every 7-10 days."
        ],
        preventiveMeasures: [
          "Practice crop rotation: Do not plant tomatoes or potatoes in the same soil for at least 3 years.",
          "Use certified disease-resistant tomato seeds.",
          "Stake plants off the ground to keep leaves dry and clean."
        ]
      }
    },
    diagnosisSw: {
      plantType: "Nyanya (Tomato)",
      diseaseName: "Mnyauko Jani au Chule ya Nyanya (Tomato Late Blight)",
      confidence: 96,
      severity: "Kali",
      description: "Ugonjwa hatari unaosababishwa na kiumbe kama kuvu aitwaye Phytophthora infestans. Huenea kwa kasi sana katika hali ya hewa yenye unyevu na baridi na unaweza kuharibu shamba zima la nyanya ndani ya siku chache.",
      symptoms: [
        "Madoa makubwa ya kijivu au kahawia kwenye majani yanayopanuka haraka.",
        "Kuvu ya kijivu au nyeupe kama pamba chini ya majani wakati wa unyevu mwingi.",
        "Madoa ya giza kwenye shina yanayosababisha mmea kunyauka na kufa.",
        "Matunda ya nyanya kuwa na madoa magumu ya kahawia na kuoza."
      ],
      treatment: {
        immediateActions: [
          "Ng'oa na uchome moto mimea iliyoathirika sana. Usiweke kwenye mbolea ya mboji.",
          "Kata matawi ya chini ili kuongeza mzunguko wa hewa na kupunguza unyevu chini ya mmea.",
          "Epuka kumwagilia maji juu ya majani; wagilia kwenye udongo chini ya mmea pekee."
        ],
        organicRemedies: [
          "Changanya kijiko 1 cha keki ya soda (Baking Soda) na vijiko 2 vya mafuta ya mimea kwenye lita 4 za maji na upige spray.",
          "Tumia dawa za asili za shaba (Copper Fungicide) ambazo zinaruhusiwa katika kilimo hai."
        ],
        chemicalOptions: [
          "Piga dawa za kuzuia ukungu zenye Mancozeb (mf. Oshothane au Dithane M-45) kuzuia ugonjwa usienee.",
          "Kwa ugonjwa uliosambaa, tumia dawa za kimfumo zenye Metalaxyl + Mancozeb (mf. Ridomil Gold) - weka gramu 40 kwenye bomba la lita 20, piga kila baada ya siku 7-10."
        ],
        preventiveMeasures: [
          "Badilisha mazao: Usipande nyanya au viazi mviringo kwenye shamba moja kwa miaka 3 mfululizo.",
          "Tumia mbegu zilizothibitishwa kustahimili magonjwa.",
          "Weka miti au kamba za kuegemeza nyanya ili kuzuia majani kugusa udongo wenye unyevu."
        ]
      }
    }
  },
  {
    id: "maize_rust",
    nameEn: "Maize / Mahindi",
    nameSw: "Mahindi (Maize)",
    diseaseEn: "Common Rust",
    diseaseSw: "Kutu ya Mahindi (Common Rust)",
    notesEn: "Small, dusty golden-brown pustules covered both surfaces of maize leaves during a cool spell.",
    notesSw: "Vipele vidogo vya unga wa rangi ya dhahabu/kahawia vilifunika pande zote mbili za majani ya mahindi msimu wa baridi.",
    imageUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' fill='%234ade80'/><path d='M30,10 Q50,50 30,90 Q70,50 30,10' fill='%2316a34a'/><rect x='45' y='30' width='4' height='12' rx='2' fill='%23ca8a04'/><rect x='35' y='50' width='3' height='10' rx='1.5' fill='%23ca8a04'/><rect x='52' y='45' width='5' height='15' rx='2.5' fill='%23ca8a04'/><rect x='40' y='20' width='3' height='8' rx='1' fill='%23ca8a04'/></svg>",
    diagnosisEn: {
      plantType: "Maize",
      diseaseName: "Maize Common Rust (Puccinia sorghi)",
      confidence: 94,
      severity: "Medium",
      description: "A common fungal disease of corn characterized by powdery golden-brown pustules. While it rarely destroys the whole plant, high levels can reduce leaf area and lower grain yields significantly.",
      symptoms: [
        "Small, elongated cinnamon-brown pustules appearing on both lower and upper leaf surfaces.",
        "Dusty orange/brown powder (spores) that rubs off on fingers.",
        "Yellowing (chlorosis) of leaves surrounding the pustules under high infection rates.",
        "Premature leaf drying and death in severe cases."
      ],
      treatment: {
        immediateActions: [
          "Remove and destroy infected leaves if the infection is limited to just a few plants.",
          "Ensure adequate nitrogen fertilizer (e.g. Urea) to help the maize plant outgrow the fungus."
        ],
        organicRemedies: [
          "Neem Oil spray can act as a natural preventive measure when sprayed early.",
          "Garlic extract sprays mixed with mild soap can disrupt fungal spore germination."
        ],
        chemicalOptions: [
          "In high-value maize seed production or severe infections, apply chemical fungicides containing Azoxystrobin (e.g., Amistar) or Tebuconazole (e.g., Folicur).",
          "Mix 10ml of Azoxystrobin based fungicide per 20L of water and spray thoroughly."
        ],
        preventiveMeasures: [
          "Plant rust-resistant hybrid maize varieties (e.g., modern Pioneer or SC hybrid seeds).",
          "Destroy crop residues after harvest by plowing them under to destroy overwintering fungal spores.",
          "Plant early in the season to avoid the cooler, wetter months when rust thrives."
        ]
      }
    },
    diagnosisSw: {
      plantType: "Mahindi (Maize)",
      diseaseName: "Kutu ya Mahindi (Maize Common Rust)",
      confidence: 94,
      severity: "Wastani",
      description: "Ugonjwa wa kuvu unaoathiri mahindi na kujitokeza kama vipele vya unga wa rangi ya mdalasini. Ingawa haumui mmea mara moja, husababisha upotevu wa nishati kwenye majani na kupunguza mavuno ya nafaka.",
      symptoms: [
        "Vipele vidogo na virefu vyenye rangi ya kutu au mdalasini kwenye pande zote za jani.",
        "Unga wa machungwa au kahawia (spores) unaoshikamana kwenye vidole ukishika.",
        "Kunjuka na kukauka kwa majani yaliyoshambuliwa sana kabla ya wakati sahihi.",
        "Kudhoofika kwa shina na punje kutokomaa vizuri."
      ],
      treatment: {
        immediateActions: [
          "Ondoa na uchome majani yenye kutu kama mmea ndio kwanza umeanza kuambukizwa.",
          "Ongeza mbolea ya nitrojeni (kama Urea au CAN) kusaidia mmea kukuza majani mapya haraka kushinda ukungu."
        ],
        organicRemedies: [
          "Mafuta ya Mwarobaini (Neem Oil) huzuia kuenea kwa kuvu yanapopulizwa mapema.",
          "Mchanganyiko wa dondoo ya kitunguu saumu na maji yenye sabuni kidogo husaidia kuua spores za kuvu."
        ],
        chemicalOptions: [
          "Kwenye mashamba ya biashara au maambukizi makubwa, tumia dawa za kisasa za ukungu kama Azoxystrobin (mf. Amistar) au Tebuconazole (mf. Folicur).",
          "Weka mililita 10 za dawa ya Azoxystrobin kwenye bomba la lita 20 na upulize majani yote."
        ],
        preventiveMeasures: [
          "Panda mbegu chotara za mahindi (hybrid) zinazostahimili magonjwa ya kutu.",
          "Choma au palilia mabaki ya mazao baada ya kuvuna ili kuua mbegu za ugonjwa zilizobaki ardhini.",
          "Panda mapema mwanzo wa msimu ili kuepuka miezi ya baridi na unyevu ambapo kutu huenea sana."
        ]
      }
    }
  },
  {
    id: "rice_blast",
    nameEn: "Rice / Mpunga",
    nameSw: "Mpunga (Rice)",
    diseaseEn: "Rice Blast",
    diseaseSw: "Mnyauko Mpunga / Rice Blast",
    notesEn: "Spindle-shaped, diamond lesions with gray centers and reddish borders formed on leaves in a flooded paddy field.",
    notesSw: "Madoa ya umbo la almasi yenye rangi ya kijivu katikati na kingo nyekundu yalionekana kwenye majani ya mpunga.",
    imageUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' fill='%2360a5fa'/><path d='M10,90 Q50,30 90,90' fill='%2310b981'/><path d='M30,90 Q50,40 70,90' fill='%23059669'/><path d='M40,50 L50,45 L60,50 L50,55 Z' fill='%237f1d1d'/><circle cx='50' cy='50' r='3' fill='%239ca3af'/><path d='M25,65 L32,61 L40,65 L32,69 Z' fill='%237f1d1d'/><circle cx='32' cy='65' r='2' fill='%239ca3af'/></svg>",
    diagnosisEn: {
      plantType: "Rice",
      diseaseName: "Rice Blast (Magnaporthe oryzae)",
      confidence: 95,
      severity: "High",
      description: "One of the most destructive diseases of rice. It can infect the plant at any growth stage, attacking leaves (leaf blast), nodes (node blast), or panicles (neck blast), leading to severe grain loss.",
      symptoms: [
        "Diamond or spindle-shaped lesions on leaves with gray/white centers and brown or reddish borders.",
        "Lesions enlarging and coalescing, causing entire leaf blades to wither and dry out.",
        "Rotting or breaking of the stem node, turning dark brown.",
        "Rotten neck (neck blast) causing the head of the rice to collapse and produce empty grains."
      ],
      treatment: {
        immediateActions: [
          "Reduce nitrogen fertilizer application immediately, as high nitrogen promotes blast susceptibility.",
          "Drain excess water if the field has been constantly waterlogged with stagnant warm water; replace with fresh water.",
          "Isolate and destroy infected rice straw after harvesting."
        ],
        organicRemedies: [
          "Apply biological control agents like Trichoderma harzianum or Bacillus subtilis to suppress the blast fungus.",
          "Spray plant extracts such as neem seed kernel extract (NSKE) 5%."
        ],
        chemicalOptions: [
          "Spray systemic triazole fungicides like Tricyclazole (e.g., Beam, Blast-off) which is highly effective against rice blast.",
          "Dilute 10-15g of Tricyclazole in 20L of water and spray at the first sign of lesions on the leaves."
        ],
        preventiveMeasures: [
          "Avoid using excessive nitrogen fertilizer; split applications into 3 balanced stages.",
          "Plant blast-resistant rice varieties recommended by local agricultural offices.",
          "Treat seeds with fungicides before sowing to kill dormant spores."
        ]
      }
    },
    diagnosisSw: {
      plantType: "Mpunga (Rice)",
      diseaseName: "Kuvu ya Mchele au Mpunga (Rice Blast)",
      confidence: 95,
      severity: "Kali",
      description: "Moja ya magonjwa hatari zaidi ya mpunga ulimwenguni. Huweza kushambulia mmea katika hatua yoyote ya ukuaji, na kuathiri majani (leaf blast), maungio ya shina (node blast), au shingo ya suke (neck blast), jambo linalopelekea hasara kubwa ya mavuno.",
      symptoms: [
        "Madoa yenye umbo la almasi au mshale yenye rangi ya kijivu/nyeupe katikati na kingo nyekundu/kahawia kwenye majani.",
        "Madoa kuongezeka na kuungana, na kusababisha jani zima kunyauka na kukauka.",
        "Maungio ya shina kuoza au kuvunjika na kuwa na rangi ya kahawia ya giza.",
        "Shingo ya suke kuoza (neck blast), na kufanya suke la mpunga kuanguka na kubeba punje tupu zisizo na mchele."
      ],
      treatment: {
        immediateActions: [
          "Punguza mara moja matumizi ya mbolea ya nitrojeni (kama Urea), kwani nitrojeni nyingi huongeza nguvu ya ugonjwa.",
          "Kausha maji yaliyotuama kama yamekuwa ya moto shamba; weka maji safi ya baridi.",
          "Ng'oa na uchome majani na mabua yaliyoambukizwa baada ya kuvuna ili kuzuia spores kubaki ardhini."
        ],
        organicRemedies: [
          "Tumia mawakala wa kibiolojia kama Trichoderma harzianum au Bacillus subtilis kupambana na ugonjwa.",
          "Nyunyizia dondoo za asili za mbegu za mwarobaini (Neem seed extract) kwa uwiano wa 5%."
        ],
        chemicalOptions: [
          "Nyunyizia dawa madhubuti za kimfumo zenye Tricyclazole (mf. Beam au Blast-off) ambazo ni maalum kwa ugonjwa wa mlipuko wa mpunga.",
          "Changanya gramu 10 hadi 15 za dawa ya Tricyclazole kwenye lita 20 za maji na upulize mara tu dalili za kwanza zinapoonekana."
        ],
        preventiveMeasures: [
          "Epuka matumizi ya mbolea ya nitrojeni kupita kiasi; gawa matumizi katika hatua 3 zenye uwiano mzuri.",
          "Panda mbegu za mpunga zinazostahimili ugonjwa wa blast kulingana na ushauri wa maafisa kilimo wa eneo lako.",
          "Kanda/safisha mbegu zako kwa dawa ya ukungu kabla ya kupanda ili kuua wadudu waliolala kwenye mbegu."
        ]
      }
    }
  }
];
