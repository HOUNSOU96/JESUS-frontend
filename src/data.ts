export const continents = [
  {
    name: "afrique",
    label: "Afrique",
    icon: "🌍",
    color: "text-green-600",
    countries: [
      { 
        name: "benin", 
        label: "Bénin", 
        flag: "/flags/benin.png",
        dioceses: [
          { name: "Porto-Novo", parishes: ["Paroisse Saint Michel de Ouando", "Paroisse Saint Paul de Dowa"] },
          { name: "Cotonou", parishes: ["Paroisse Saint Pierre", "Paroisse Sainte Thérèse"] },
          { name: "Parakou", parishes: ["Paroisse Saint Paul", "Paroisse Saint Joseph"] },
          { name: "Djougou", parishes: ["Paroisse Notre-Dame", "Paroisse Saint Antoine"] },
          { name: "Natitingou", parishes: ["Paroisse Saint Jean", "Paroisse Saint François"] },
        ],
      },
      { 
        name: "nigeria", 
        label: "Nigeria", 
        flag: "/flags/nigeria.png",
        dioceses: [
          { name: "Lagos", parishes: ["Paroisse Saint George", "Paroisse Saint Mary"] },
          { name: "Abuja", parishes: ["Paroisse Saint Paul", "Paroisse Saint Peter"] },
          { name: "Kaduna", parishes: ["Paroisse Saint Michael", "Paroisse Saint Joseph"] },
          { name: "Onitsha", parishes: ["Paroisse Sainte Thérèse", "Paroisse Saint John"] },
        ]
      },
      { 
        name: "kenya", 
        label: "Kenya", 
        flag: "/flags/kenya.png",
        dioceses: [
          { name: "Nairobi", parishes: ["Paroisse Saint Joseph", "Paroisse Saint Mary"] },
          { name: "Mombasa", parishes: ["Paroisse Saint Peter", "Paroisse Saint Paul"] },
          { name: "Kisumu", parishes: ["Paroisse Sainte Anne", "Paroisse Saint Francis"] },
          { name: "Eldoret", parishes: ["Paroisse Saint George", "Paroisse Saint Michael"] },
        ]
      },
    ],
  },

  {
    name: "europe",
    label: "Europe",
    icon: "🌍",
    color: "text-blue-600",
    countries: [
      { 
        name: "france", 
        label: "France", 
        flag: "/flags/france.png",
        dioceses: [
          { name: "Paris", parishes: ["Notre-Dame", "Saint-Germain"] },
          { name: "Lyon", parishes: ["Saint Jean", "Saint Michel"] },
          { name: "Marseille", parishes: ["Saint Victor", "Saint Charles"] },
          { name: "Bordeaux", parishes: ["Saint Pierre", "Saint Paul"] },
        ]
      },
      { 
        name: "allemagne", 
        label: "Allemagne", 
        flag: "/flags/allemagne.png",
        dioceses: [
          { name: "Berlin", parishes: ["Saint Mary", "Saint Joseph"] },
          { name: "Munich", parishes: ["Saint Peter", "Saint Paul"] },
          { name: "Hambourg", parishes: ["Saint George", "Saint Michael"] },
          { name: "Cologne", parishes: ["Saint John", "Saint Francis"] },
        ]
      },
      { 
        name: "espagne", 
        label: "Espagne", 
        flag: "/flags/espagne.png",
        dioceses: [
          { name: "Madrid", parishes: ["Saint James", "Saint John"] },
          { name: "Barcelone", parishes: ["Saint Mary", "Saint Peter"] },
          { name: "Valence", parishes: ["Saint Paul", "Saint Michael"] },
          { name: "Séville", parishes: ["Saint George", "Saint Francis"] },
        ]
      },
    ]
  },

  {
    name: "asie",
    label: "Asie",
    icon: "🌏",
    color: "text-red-600",
    countries: [
      { 
        name: "chine", 
        label: "Chine", 
        flag: "/flags/chine.png",
        dioceses: [
          { name: "Beijing", parishes: ["Paroisse Saint Paul", "Paroisse Saint Pierre"] },
          { name: "Shanghai", parishes: ["Paroisse Saint Jean", "Paroisse Saint François"] },
          { name: "Guangzhou", parishes: ["Paroisse Saint Michel", "Paroisse Saint Antoine"] },
          { name: "Shenzhen", parishes: ["Paroisse Saint Georges", "Paroisse Sainte Thérèse"] },
        ]
      },
      { 
        name: "japon", 
        label: "Japon", 
        flag: "/flags/japon.png",
        dioceses: [
          { name: "Tokyo", parishes: ["Paroisse Saint Paul", "Paroisse Saint John"] },
          { name: "Osaka", parishes: ["Paroisse Saint Mary", "Paroisse Saint Peter"] },
          { name: "Nagoya", parishes: ["Paroisse Saint Joseph", "Paroisse Saint Francis"] },
          { name: "Kyoto", parishes: ["Paroisse Sainte Anne", "Paroisse Saint Michel"] },
        ]
      },
      { 
        name: "inde", 
        label: "Inde", 
        flag: "/flags/inde.png",
        dioceses: [
          { name: "Goa", parishes: ["Paroisse Saint Paul", "Paroisse Saint Pierre"] },
          { name: "Mumbai", parishes: ["Paroisse Saint John", "Paroisse Saint Mary"] },
          { name: "Delhi", parishes: ["Paroisse Saint Joseph", "Paroisse Saint François"] },
          { name: "Bangalore", parishes: ["Paroisse Saint Michel", "Paroisse Saint Georges"] },
        ]
      },
    ]
  },

  {
    name: "amerique",
    label: "Amérique",
    icon: "🌎",
    color: "text-orange-600",
    countries: [
      { 
        name: "usa", 
        label: "États-Unis", 
        flag: "/flags/usa.png",
        dioceses: [
          { name: "New York", parishes: ["Paroisse Saint Patrick", "Paroisse Saint Mary"] },
          { name: "Los Angeles", parishes: ["Paroisse Saint Paul", "Paroisse Saint Peter"] },
          { name: "Chicago", parishes: ["Paroisse Saint Joseph", "Paroisse Saint Francis"] },
          { name: "Boston", parishes: ["Paroisse Saint John", "Paroisse Sainte Thérèse"] },
        ]
      },
      { 
        name: "canada", 
        label: "Canada", 
        flag: "/flags/canada.png",
        dioceses: [
          { name: "Toronto", parishes: ["Paroisse Saint Paul", "Paroisse Saint Peter"] },
          { name: "Montréal", parishes: ["Paroisse Saint Joseph", "Paroisse Saint Mary"] },
          { name: "Vancouver", parishes: ["Paroisse Saint John", "Paroisse Saint Francis"] },
          { name: "Québec", parishes: ["Paroisse Sainte Thérèse", "Paroisse Saint Michel"] },
        ]
      },
      { 
        name: "bresil", 
        label: "Brésil", 
        flag: "/flags/bresil.png",
        dioceses: [
          { name: "Rio de Janeiro", parishes: ["Paroisse Saint Paul", "Paroisse Saint Peter"] },
          { name: "São Paulo", parishes: ["Paroisse Saint Joseph", "Paroisse Saint Mary"] },
          { name: "Brasília", parishes: ["Paroisse Saint John", "Paroisse Saint Francis"] },
          { name: "Salvador", parishes: ["Paroisse Saint Michel", "Paroisse Saint Georges"] },
        ]
      },
    ]
  },

  {
    name: "oceanie",
    label: "Océanie",
    icon: "🌏",
    color: "text-purple-600",
    countries: [
      { 
        name: "australie", 
        label: "Australie", 
        flag: "/flags/australie.png",
        dioceses: [
          { name: "Sydney", parishes: ["Paroisse Saint Mary", "Paroisse Saint Paul"] },
          { name: "Melbourne", parishes: ["Paroisse Saint John", "Paroisse Saint Joseph"] },
          { name: "Brisbane", parishes: ["Paroisse Saint Michel", "Paroisse Sainte Thérèse"] },
          { name: "Perth", parishes: ["Paroisse Saint Georges", "Paroisse Saint Francis"] },
        ]
      },
      { 
        name: "nouvellezelande", 
        label: "Nouvelle-Zélande", 
        flag: "/flags/nouvellezelande.png",
        dioceses: [
          { name: "Auckland", parishes: ["Paroisse Saint Mary", "Paroisse Saint Paul"] },
          { name: "Wellington", parishes: ["Paroisse Saint John", "Paroisse Saint Joseph"] },
          { name: "Christchurch", parishes: ["Paroisse Saint Michel", "Paroisse Sainte Thérèse"] },
          { name: "Dunedin", parishes: ["Paroisse Saint Georges", "Paroisse Saint Francis"] },
        ]
      },
    ]
  },

  {
    name: "antarctique",
    label: "Antarctique",
    icon: "❄️",
    color: "text-cyan-600",
    countries: [],
  },
];
