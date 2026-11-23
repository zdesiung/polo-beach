export interface UbigeoDepartment {
  name: string;
  isLimaMetro: boolean;
  provinces: {
    name: string;
    districts: string[];
  }[];
}

export const PERU_UBIGEO: UbigeoDepartment[] = [
  {
    name: 'Lima',
    isLimaMetro: true,
    provinces: [
      {
        name: 'Lima',
        districts: [
          'Miraflores',
          'Barranco',
          'San Isidro',
          'Santiago de Surco',
          'San Borja',
          'La Molina',
          'Magdalena del Mar',
          'Jesús María',
          'Lince',
          'Pueblo Libre',
          'San Miguel',
          'Chorrillos',
          'Punta Hermosa',
          'Punta Negra',
          'San Bartolo',
          'Santa María del Mar',
          'Lurín',
        ],
      },
      {
        name: 'Cañete',
        districts: ['Asia', 'Mala', 'Cerro Azul', 'San Vicente de Cañete'],
      },
      {
        name: 'Huaura',
        districts: ['Huacho', 'Végueta', 'Hualmay'],
      },
    ],
  },
  {
    name: 'Piura',
    isLimaMetro: false,
    provinces: [
      {
        name: 'Talara',
        districts: ['Máncora', 'Los Órganos', 'El Alto', 'Lobitos', 'Pariñas'],
      },
      {
        name: 'Piura',
        districts: ['Piura', 'Castilla', 'Veintiséis de Octubre'],
      },
      {
        name: 'Paita',
        districts: ['Paita', 'Colán', 'Vichayal'],
      },
    ],
  },
  {
    name: 'La Libertad',
    isLimaMetro: false,
    provinces: [
      {
        name: 'Trujillo',
        districts: ['Trujillo', 'Huanchaco', 'Víctor Larco Herrera', 'Salaverry', 'Moche'],
      },
      {
        name: 'Pacasmayo',
        districts: ['Pacasmayo', 'San Pedro de Lloc'],
      },
      {
        name: 'Ascope',
        districts: ['Chicama', 'Rázuri (Puerto Malabrigo)'],
      },
    ],
  },
  {
    name: 'Ica',
    isLimaMetro: false,
    provinces: [
      {
        name: 'Pisco',
        districts: ['Paracas', 'Pisco', 'San Andrés'],
      },
      {
        name: 'Ica',
        districts: ['Ica', 'La Tinguiña', 'Subtanjalla'],
      },
      {
        name: 'Chincha',
        districts: ['Chincha Alta', 'Sunampe', 'Grocio Prado'],
      },
    ],
  },
  {
    name: 'Arequipa',
    isLimaMetro: false,
    provinces: [
      {
        name: 'Arequipa',
        districts: ['Arequipa', 'Cayma', 'Yanahuara', 'Cerro Colorado', 'José Luis Bustamante y Rivero'],
      },
      {
        name: 'Islay',
        districts: ['Mollendo', 'Mejía', 'Cocachacra'],
      },
      {
        name: 'Camaná',
        districts: ['Camaná', 'Samuel Pastor'],
      },
    ],
  },
  {
    name: 'Lambayeque',
    isLimaMetro: false,
    provinces: [
      {
        name: 'Chiclayo',
        districts: ['Chiclayo', 'Pimentel', 'Santa Rosa', 'La Victoria'],
      },
    ],
  },
  {
    name: 'Tumbes',
    isLimaMetro: false,
    provinces: [
      {
        name: 'Contralmirante Villar',
        districts: ['Zorritos', 'Canoas de Punta Sal'],
      },
      {
        name: 'Tumbes',
        districts: ['Tumbes', 'Corrales', 'La Cruz'],
      },
    ],
  },
  {
    name: 'Áncash',
    isLimaMetro: false,
    provinces: [
      {
        name: 'Santa',
        districts: ['Chimbote', 'Nuevo Chimbote', 'Samanco'],
      },
      {
        name: 'Huarmey',
        districts: ['Huarmey', 'Culebras'],
      },
    ],
  },
  {
    name: 'Cusco',
    isLimaMetro: false,
    provinces: [
      {
        name: 'Cusco',
        districts: ['Cusco', 'Wanchaq', 'San Sebastián', 'Santiago'],
      },
    ],
  },
];
