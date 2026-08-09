/**
 * Certificate catalogue.
 *
 * The images used to be pulled in by ~95 hand-written `import CERT_NEW_47 from
 * '../assets/certs/...'` statements feeding a ~700-line array inside the
 * component. `import.meta.glob` derives the same list from the folder, so
 * adding a certificate means dropping a file in `assets/certs/`.
 */

const certModules = import.meta.glob('../assets/certs/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
});

const fileName = (path) => path.split('/').pop().replace(/\.(png|jpe?g|webp)$/i, '');

/** `google_it_support` -> `Google It Support`, used when no explicit label exists. */
const titleiseFileName = (name) =>
  name
    .replace(/[-_.]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());

/**
 * The twelve worth an employer's attention: specialisations and professional
 * certificates, not individual course completions. `verifyUrl` is a real Credly
 * badge where one exists - never fabricate these, an unverifiable credential is
 * worth less than no credential.
 */
const FEATURED = [
  {
    file: 'deep_learning_specialization_cert',
    label: 'Deep Learning Specialization',
    issuer: 'DeepLearning.AI',
    verifyUrl: 'https://www.credly.com/badges/0e31be95-09a7-4724-a81a-e938672dee4c',
  },
  {
    file: 'tensorflow_developer_specialization_cert',
    label: 'TensorFlow Developer Professional Certificate',
    issuer: 'DeepLearning.AI',
  },
  {
    file: 'google_advanced_data_analytics_cert',
    label: 'Google Advanced Data Analytics',
    issuer: 'Google',
    verifyUrl: 'https://www.credly.com/badges/ec8c93a7-6ea7-482d-b8bc-6b53a9d87e20',
  },
  {
    file: 'google_data_analytics_specialization_cert',
    label: 'Google Data Analytics',
    issuer: 'Google',
    verifyUrl: 'https://www.credly.com/badges/55f2feeb-4633-4408-b34e-7d87c918b9b7',
  },
  {
    file: 'google_business_intelligence',
    label: 'Google Business Intelligence',
    issuer: 'Google',
    verifyUrl: 'https://www.credly.com/badges/8392ba7c-bf25-4d4b-a61f-5cb2bceeb5af',
  },
  {
    file: 'ibm_devops_and_software_engineering_specialization_cert',
    label: 'IBM DevOps & Software Engineering',
    issuer: 'IBM',
    verifyUrl: 'https://www.credly.com/badges/18e220fc-558f-4a77-91ff-bb39749ac000',
  },
  {
    file: 'google_it_support',
    label: 'Google IT Support',
    issuer: 'Google',
    verifyUrl: 'https://www.credly.com/badges/a734660f-1ece-4783-9e12-ca49d2933513',
  },
  {
    file: 'google_it_automate_python',
    label: 'Google IT Automation with Python',
    issuer: 'Google',
    verifyUrl: 'https://www.credly.com/badges/0b73e2c3-3795-4343-a1fa-260e040bdc0a',
  },
  {
    file: 'dsa_ucsandiego_specialization_cert',
    label: 'Data Structures & Algorithms Specialization',
    issuer: 'UC San Diego',
  },
  {
    file: 'applied_statistical_methods_for_research',
    label: 'Applied Statistical Methods for Research',
    issuer: 'University of the West Indies',
  },
  {
    file: 'nicholas_dcit_bootcampt_2024_mentor',
    label: 'DCIT Bootcamp 2024 - Mentor',
    issuer: 'UWI DCIT',
  },
  {
    file: 'convolutional_neural_network_cert',
    label: 'Convolutional Neural Networks',
    issuer: 'DeepLearning.AI',
  },
];

const byFileName = Object.entries(certModules).reduce((acc, [path, url]) => {
  acc[fileName(path)] = url;
  return acc;
}, {});

export const featuredCertificates = FEATURED
  .filter((c) => byFileName[c.file])
  .map((c) => ({ ...c, id: c.file, image: byFileName[c.file] }));

const featuredFiles = new Set(FEATURED.map((c) => c.file));

/** Everything else, alphabetical, shown only when the visitor asks. */
export const otherCertificates = Object.keys(byFileName)
  .filter((name) => !featuredFiles.has(name))
  .sort()
  .map((name) => ({
    id: name,
    label: titleiseFileName(name),
    image: byFileName[name],
  }));

export const totalCertificateCount = featuredCertificates.length + otherCertificates.length;

/** Competition placings and scholarships - distinct from coursework. */
export const awards = [
  {
    title: 'Udacity AI Programming Scholarship',
    subtitle: 'AI Programming with Python Nanodegree',
    description:
      'Full scholarship to complete the AI Programming with Python Nanodegree, covering foundational AI and ML concepts.',
    url: 'https://www.linkedin.com/posts/nicholas-smith-933125148_ai-programming-with-python-nanodegree-activity-7005266589868564480-KAxF',
  },
  {
    title: 'WiDS Datathon 2023 - 2nd in Trinidad & Tobago',
    subtitle: 'Women in Data Science, sub-seasonal temperature forecasting',
    description:
      'Placed 2nd in the Trinidad & Tobago chapter and 183rd of 697 teams globally.',
    url: 'https://www.linkedin.com/posts/nicholas-smith-933125148_certificate-of-participation-in-wids-2023-activity-7040796180926099457-wvrs',
  },
  {
    title: 'WiDS Datathon 2024 - 3rd in Trinidad & Tobago',
    subtitle: 'Women in Data Science',
    description: 'Placed 3rd in the Trinidad & Tobago chapter.',
  },
  {
    title: 'Google Certificates Scholarship',
    subtitle: 'IT Support and IT Automation with Python',
    description:
      'Google-funded scholarship covering system administration, networking, security and Python automation.',
    url: 'https://www.linkedin.com/posts/nicholas-smith-933125148_google-it-support-certificate-was-issued-activity-6839058607724658688-9NEe',
  },
];
