import addressUiSchema from 'platform/forms-system/src/js/definitions/profileAddress';

const checkboxTitle = 'I live on a U.S. military base outside of the country.';
export const title = 'Mailing address';

export const schema = {
  type: 'object',
  title,
  properties: {
    address: {
      type: 'object',
      properties: {
        isMilitary: {
          type: 'boolean',
        },
        country: {
          type: 'string',
          enum: [
            'AFG',
            'ALB',
            'DZA',
            'AND',
            'AGO',
            'AIA',
            'ATA',
            'ATG',
            'ARG',
            'ARM',
            'ABW',
            'AUS',
            'AUT',
            'AZE',
            'BHS',
            'BHR',
            'BGD',
            'BRB',
            'BLR',
            'BEL',
            'BLZ',
            'BEN',
            'BMU',
            'BTN',
            'BOL',
            'BIH',
            'BWA',
            'BVT',
            'BRA',
            'IOT',
            'BRN',
            'BGR',
            'BFA',
            'BDI',
            'KHM',
            'CMR',
            'CAN',
            'CPV',
            'CYM',
            'CAF',
            'TCD',
            'CHL',
            'CHN',
            'CXR',
            'CCK',
            'COL',
            'COM',
            'COG',
            'COD',
            'COK',
            'CRI',
            'CIV',
            'HRV',
            'CUB',
            'CYP',
            'CZE',
            'DNK',
            'DJI',
            'DMA',
            'DOM',
            'ECU',
            'EGY',
            'SLV',
            'GNQ',
            'ERI',
            'EST',
            'ETH',
            'FLK',
            'FRO',
            'FJI',
            'FIN',
            'FRA',
            'GUF',
            'PYF',
            'ATF',
            'GAB',
            'GMB',
            'GEO',
            'DEU',
            'GHA',
            'GIB',
            'GRC',
            'GRL',
            'GRD',
            'GLP',
            'GTM',
            'GIN',
            'GNB',
            'GUY',
            'HTI',
            'HMD',
            'HND',
            'HKG',
            'HUN',
            'ISL',
            'IND',
            'IDN',
            'IRN',
            'IRQ',
            'IRL',
            'ISR',
            'ITA',
            'JAM',
            'JPN',
            'JOR',
            'KAZ',
            'KEN',
            'KIR',
            'PRK',
            'KOR',
            'KWT',
            'KGZ',
            'LAO',
            'LVA',
            'LBN',
            'LSO',
            'LBR',
            'LBY',
            'LIE',
            'LTU',
            'LUX',
            'MAC',
            'MKD',
            'MDG',
            'MWI',
            'MYS',
            'MDV',
            'MLI',
            'MLT',
            'MTQ',
            'MRT',
            'MUS',
            'MYT',
            'MEX',
            'FSM',
            'MDA',
            'MCO',
            'MNG',
            'MSR',
            'MAR',
            'MOZ',
            'MMR',
            'NAM',
            'NRU',
            'NPL',
            'ANT',
            'NLD',
            'NCL',
            'NZL',
            'NIC',
            'NER',
            'NGA',
            'NIU',
            'NFK',
            'NOR',
            'OMN',
            'PAK',
            'PAN',
            'PNG',
            'PRY',
            'PER',
            'PHL',
            'PCN',
            'POL',
            'PRT',
            'QAT',
            'REU',
            'ROU',
            'RUS',
            'RWA',
            'SHN',
            'KNA',
            'LCA',
            'SPM',
            'VCT',
            'SMR',
            'STP',
            'SAU',
            'SEN',
            'SCG',
            'SYC',
            'SLE',
            'SGP',
            'SVK',
            'SVN',
            'SLB',
            'SOM',
            'ZAF',
            'SGS',
            'ESP',
            'LKA',
            'SDN',
            'SUR',
            'SWZ',
            'SWE',
            'CHE',
            'SYR',
            'TWN',
            'TJK',
            'TZA',
            'THA',
            'TLS',
            'TGO',
            'TKL',
            'TON',
            'TTO',
            'TUN',
            'TUR',
            'TKM',
            'TCA',
            'TUV',
            'UGA',
            'UKR',
            'ARE',
            'GBR',
            'URY',
            'UZB',
            'VUT',
            'VAT',
            'VEN',
            'VNM',
            'VGB',
            'WLF',
            'ESH',
            'YEM',
            'ZMB',
            'ZWE',
          ],
          enumNames: [
            'Afghanistan',
            'Albania',
            'Algeria',
            'Andorra',
            'Angola',
            'Anguilla',
            'Antarctica',
            'Antigua',
            'Argentina',
            'Armenia',
            'Aruba',
            'Australia',
            'Austria',
            'Azerbaijan',
            'Bahamas',
            'Bahrain',
            'Bangladesh',
            'Barbados',
            'Belarus',
            'Belgium',
            'Belize',
            'Benin',
            'Bermuda',
            'Bhutan',
            'Bolivia',
            'Bosnia',
            'Botswana',
            'Bouvet Island',
            'Brazil',
            'British Indian Ocean Territories',
            'Brunei Darussalam',
            'Bulgaria',
            'Burkina Faso',
            'Burundi',
            'Cambodia',
            'Cameroon',
            'Canada',
            'Cape Verde',
            'Cayman',
            'Central African Republic',
            'Chad',
            'Chile',
            'China',
            'Christmas Island',
            'Cocos Islands',
            'Colombia',
            'Comoros',
            'Congo',
            'Democratic Republic of the Congo',
            'Cook Islands',
            'Costa Rica',
            'Ivory Coast',
            'Croatia',
            'Cuba',
            'Cyprus',
            'Czech Republic',
            'Denmark',
            'Djibouti',
            'Dominica',
            'Dominican Republic',
            'Ecuador',
            'Egypt',
            'El Salvador',
            'Equatorial Guinea',
            'Eritrea',
            'Estonia',
            'Ethiopia',
            'Falkland Islands',
            'Faroe Islands',
            'Fiji',
            'Finland',
            'France',
            'French Guiana',
            'French Polynesia',
            'French Southern Territories',
            'Gabon',
            'Gambia',
            'Georgia',
            'Germany',
            'Ghana',
            'Gibraltar',
            'Greece',
            'Greenland',
            'Grenada',
            'Guadeloupe',
            'Guatemala',
            'Guinea',
            'Guinea-Bissau',
            'Guyana',
            'Haiti',
            'Heard Island',
            'Honduras',
            'Hong Kong',
            'Hungary',
            'Iceland',
            'India',
            'Indonesia',
            'Iran',
            'Iraq',
            'Ireland',
            'Israel',
            'Italy',
            'Jamaica',
            'Japan',
            'Jordan',
            'Kazakhstan',
            'Kenya',
            'Kiribati',
            'North Korea',
            'South Korea',
            'Kuwait',
            'Kyrgyzstan',
            'Laos',
            'Latvia',
            'Lebanon',
            'Lesotho',
            'Liberia',
            'Libya',
            'Liechtenstein',
            'Lithuania',
            'Luxembourg',
            'Macao',
            'Macedonia',
            'Madagascar',
            'Malawi',
            'Malaysia',
            'Maldives',
            'Mali',
            'Malta',
            'Martinique',
            'Mauritania',
            'Mauritius',
            'Mayotte',
            'Mexico',
            'Micronesia',
            'Moldova',
            'Monaco',
            'Mongolia',
            'Montserrat',
            'Morocco',
            'Mozambique',
            'Myanmar',
            'Namibia',
            'Nauru',
            'Nepal',
            'Netherlands Antilles',
            'Netherlands',
            'New Caledonia',
            'New Zealand',
            'Nicaragua',
            'Niger',
            'Nigeria',
            'Niue',
            'Norfolk',
            'Norway',
            'Oman',
            'Pakistan',
            'Panama',
            'Papua New Guinea',
            'Paraguay',
            'Peru',
            'Philippines',
            'Pitcairn',
            'Poland',
            'Portugal',
            'Qatar',
            'Reunion',
            'Romania',
            'Russia',
            'Rwanda',
            'Saint Helena',
            'Saint Kitts and Nevis',
            'Saint Lucia',
            'Saint Pierre and Miquelon',
            'Saint Vincent and the Grenadines',
            'San Marino',
            'Sao Tome and Principe',
            'Saudi Arabia',
            'Senegal',
            'Serbia',
            'Seychelles',
            'Sierra Leone',
            'Singapore',
            'Slovakia',
            'Slovenia',
            'Solomon Islands',
            'Somalia',
            'South Africa',
            'South Georgia and the South Sandwich Islands',
            'Spain',
            'Sri Lanka',
            'Sudan',
            'Suriname',
            'Swaziland',
            'Sweden',
            'Switzerland',
            'Syrian Arab Republic',
            'Taiwan',
            'Tajikistan',
            'Tanzania',
            'Thailand',
            'Timor-Leste',
            'Togo',
            'Tokelau',
            'Tonga',
            'Trinidad and Tobago',
            'Tunisia',
            'Turkey',
            'Turkmenistan',
            'Turks and Caicos Islands',
            'Tuvalu',
            'Uganda',
            'Ukraine',
            'United Arab Emirates',
            'United Kingdom',
            'Uruguay',
            'Uzbekistan',
            'Vanuatu',
            'Vatican',
            'Venezuela',
            'Vietnam',
            'British Virgin Islands',
            'Wallis and Futuna',
            'Western Sahara',
            'Yemen',
            'Zambia',
            'Zimbabwe',
          ],
        },
        'view:militaryBaseDescription': {
          type: 'object',
          properties: {},
        },
        street: {
          type: 'string',
          minLength: 1,
          maxLength: 100,
        },
        street2: {
          type: 'string',
          minLength: 1,
          maxLength: 100,
        },
        street3: {
          type: 'string',
          minLength: 1,
          maxLength: 100,
        },
        city: {
          type: 'string',
          minLength: 1,
          maxLength: 100,
        },
        state: {
          type: 'string',
          enum: [
            'AL',
            'AK',
            'AS',
            'AZ',
            'AR',
            'CA',
            'CO',
            'CT',
            'DE',
            'DC',
            'FM',
            'FL',
            'GA',
            'GU',
            'HI',
            'ID',
            'IL',
            'IN',
            'IA',
            'KS',
            'KY',
            'LA',
            'ME',
            'MH',
            'MD',
            'MA',
            'MI',
            'MN',
            'MS',
            'MO',
            'MT',
            'NE',
            'NV',
            'NH',
            'NJ',
            'NM',
            'NY',
            'NC',
            'ND',
            'MP',
            'OH',
            'OK',
            'OR',
            'PW',
            'PA',
            'PR',
            'RI',
            'SC',
            'SD',
            'TN',
            'TX',
            'UT',
            'VT',
            'VI',
            'VA',
            'WA',
            'WV',
            'WI',
            'WY',
          ],
          enumNames: [
            'Alabama',
            'Alaska',
            'American Samoa',
            'Arizona',
            'Arkansas',
            'California',
            'Colorado',
            'Connecticut',
            'Delaware',
            'District Of Columbia',
            'Federated States Of Micronesia',
            'Florida',
            'Georgia',
            'Guam',
            'Hawaii',
            'Idaho',
            'Illinois',
            'Indiana',
            'Iowa',
            'Kansas',
            'Kentucky',
            'Louisiana',
            'Maine',
            'Marshall Islands',
            'Maryland',
            'Massachusetts',
            'Michigan',
            'Minnesota',
            'Mississippi',
            'Missouri',
            'Montana',
            'Nebraska',
            'Nevada',
            'New Hampshire',
            'New Jersey',
            'New Mexico',
            'New York',
            'North Carolina',
            'North Dakota',
            'Northern Mariana Islands',
            'Ohio',
            'Oklahoma',
            'Oregon',
            'Palau',
            'Pennsylvania',
            'Puerto Rico',
            'Rhode Island',
            'South Carolina',
            'South Dakota',
            'Tennessee',
            'Texas',
            'Utah',
            'Vermont',
            'Virgin Islands',
            'Virginia',
            'Washington',
            'West Virginia',
            'Wisconsin',
            'Wyoming',
          ],
        },
        postalCode: {
          type: 'string',
        },
      },
    },
  },
};

export const uiSchema = {
  'ui:description':
    'We’ll send any updates about your application to this address.',
  address: addressUiSchema('address', checkboxTitle, () => true),
};
