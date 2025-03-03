/**
 * Types of optical corrections from ADL file
 * Each type has a corresponding code from the archetype
 */
export const CORRECTION_TYPES = [
  {
    value: "Autorefraction-based trial Lenses",
    code: "at0264", // For right eye, at0338 for left eye
    snomed: "",
    requiresLensSpecification: true
  },
  {
    value: "Subjective Refraction-based trial Lenses",
    code: "at0265", // For right eye, at0339 for left eye
    snomed: "",
    requiresLensSpecification: true
  },
  {
    value: "Own Glasses",
    code: "at0266", // For right eye, at0340 for left eye
    snomed: "",
    requiresLensSpecification: true
  },
  {
    value: "Hard Contact Lens",
    code: "at0267", // For right eye, at0341 for left eye
    snomed: "",
    requiresLensSpecification: true
  },
  {
    value: "Soft Contact Lens",
    code: "at0268", // For right eye, at0342 for left eye
    snomed: "",
    requiresLensSpecification: true
  },
  {
    value: "Subjective Refraction without Cycloplegia-based Trial Lenses",
    code: "at0269", // For right eye, at0343 for left eye
    snomed: "",
    requiresLensSpecification: true
  },
  {
    value: "Subjective Refraction with Cycloplegia-based Trial Lenses",
    code: "at0270", // For right eye, at0344 for left eye
    snomed: "",
    requiresLensSpecification: true
  },
  {
    value: "Retinoscopy-Based Trial Lenses",
    code: "at0271", // For right eye, at0345 for left eye
    snomed: "",
    requiresLensSpecification: true
  },
  {
    value: "Trial Lenses",
    code: "at0272", // For right eye, at0346 for left eye
    snomed: "",
    requiresLensSpecification: true
  },
  {
    value: "Fogging lens",
    code: "at0273", // For right eye, at0347 for left eye
    snomed: "",
    requiresLensSpecification: true
  },
  {
    value: "Pinhole Occluder",
    code: "at0274", // For right eye, at0348 for left eye
    snomed: "",
    requiresLensSpecification: false
  },
  {
    value: "Subjective Overrefraction-based Trial Lenses",
    code: "at0275", // For right eye, at0349 for left eye
    snomed: "",
    requiresLensSpecification: true
  },
  {
    value: "None - Uncorrected",
    code: "at0276", // For right eye, at0350 for left eye
    snomed: "",
    requiresLensSpecification: false
  }
];

/**
 * Qualitative measures for visual acuity
 */
export const QUALITATIVE_MEASURES = [
  {
    value: "HM - Hand movement",
    code: "at0152",
    snomed: "260295004"
  },
  {
    value: "CF - Count fingers",
    code: "at0153",
    snomed: "LA24679-5" // LOINC code
  },
  {
    value: "PL - Perceives Light",
    code: "at0154",
    snomed: "260296003"
  },
  {
    value: "PLAP - Perceives Light, accurate Projection",
    code: "at0155",
    snomed: "260297007"
  },
  {
    value: "PLIP - Perceives Light, inaccurate Projection",
    code: "at0156",
    snomed: "260298002"
  },
  {
    value: "CSMF - Central Steady Maintained Fixation",
    code: "at0157",
    snomed: "LA25490-6" // LOINC code
  },
  {
    value: "CUMF - Central Unsteady Maintained Fixation",
    code: "at0158",
    snomed: "LA25491-4" // LOINC code
  },
  {
    value: "FF - Fix and Follow",
    code: "at0159",
    snomed: "LA25492-2" // LOINC code
  },
  {
    value: "BFL - Blinks for Light",
    code: "at0160",
    snomed: "LA25493-0" // LOINC code
  },
  {
    value: "NPL - No Light Perception",
    code: "at0161",
    snomed: "63063006"
  },
  {
    value: "OtO - Objection to Occlusion",
    code: "at0260",
    snomed: "local"
  },
  {
    value: "NI - No Improvement",
    code: "at0280",
    snomed: "local"
  }
];

/**
 * Chart types from the ADL file
 */
export const CHART_TYPES = [
  {
    value: "logMar chart",
    code: "at0082"
  },
  {
    value: "Snellen chart",
    code: "at0083"
  },
  {
    value: "ETDRS chart",
    code: "at0084"
  },
  {
    value: "ETDRS Original Series Chart 1",
    code: "at0109"
  },
  {
    value: "ETDRS Original Series Chart 2",
    code: "at0096"
  },
  {
    value: "ETDRS Original Series Chart R",
    code: "at0097"
  },
  {
    value: "ETDRS Revised Series Chart 1",
    code: "at0098"
  },
  {
    value: "ETDRS Revised Series Chart 2",
    code: "at0099"
  },
  {
    value: "ETDRS Revised Series Chart 3",
    code: "at0238"
  },
  {
    value: "Golovin-Sitsev table",
    code: "at0239"
  },
  {
    value: "Monoyer Visual Acuity chart",
    code: "at0240"
  },
  {
    value: "Cardiff Acuity Cards",
    code: "at0241"
  },
  {
    value: "Keeler Acuity Cards",
    code: "at0242"
  },
  {
    value: "Teller Acuity Cards",
    code: "at0243"
  }
];

/**
 * General methods for visual acuity testing from the ADL file
 */
export const TESTING_METHODS = [
  {
    value: "Laser Interferometer",
    code: "at0227"
  },
  {
    value: "Near Card",
    code: "at0228"
  },
  {
    value: "Guyton and Minkowski Potential Acuity Meter",
    code: "at0229"
  },
  {
    value: "Handheld Retinometer",
    code: "at0230"
  },
  {
    value: "Visual Acuity Chart",
    code: "at0231"
  },
  {
    value: "Preferential Looking Test",
    code: "at0232"
  },
  {
    value: "Fixation Testing",
    code: "at0233"
  },
  {
    value: "Optokinetic Nystagmus Test",
    code: "at0234"
  },
  {
    value: "Boeck's Candy Test",
    code: "at0235"
  },
  {
    value: "Visual Evoked Potential",
    code: "at0236"
  },
  {
    value: "Cardiff Acuity Test",
    code: "at0237"
  },
  {
    value: "Electronic Visual Acuity Testing",
    code: "at0257"
  },
  {
    value: "Near Reading Card",
    code: "at0334"
  },
  {
    value: "Near Card with Optotypes",
    code: "at0335"
  }
];

/**
 * Optotype types from the ADL file
 */
export const OPTOTYPE_TYPES = [
  {
    value: "Pictogramm",
    code: "at0108"
  },
  {
    value: "Orientation-Type Optotypes",
    code: "at0107"
  },
  {
    value: "Letters",
    code: "at0106"
  },
  {
    value: "Lea Symbol",
    code: "at0206"
  },
  {
    value: "Kay Picture",
    code: "at0207"
  },
  {
    value: "Allen Picture",
    code: "at0208"
  },
  {
    value: "Auckland",
    code: "at0209"
  },
  {
    value: "Amsterdam Picture",
    code: "at0210"
  },
  {
    value: "Landolt C",
    code: "at0211"
  },
  {
    value: "Tumbling E",
    code: "at0212"
  },
  {
    value: "Numbers",
    code: "at0213"
  },
  {
    value: "Precision Vision Numbers",
    code: "at0214"
  },
  {
    value: "Lea Numbers",
    code: "at0215"
  },
  {
    value: "Sloan Letters",
    code: "at0216"
  },
  {
    value: "Cyrillic Letters",
    code: "at0217"
  },
  {
    value: "Snellen Letters",
    code: "at0218"
  },
  {
    value: "HOTV Letters",
    code: "at0219"
  },
  {
    value: "LRVC Letters",
    code: "at0220"
  },
  {
    value: "British Letters (2003)",
    code: "at0221"
  },
  {
    value: "European-Wide Letters",
    code: "at0222"
  }
];

/**
 * Optotype presentation modifiers from the ADL file
 */
export const OPTOTYPE_PRESENTATION_MODIFIERS = [
  {
    value: "Single Optotype Presentation",
    code: "at0253"
  },
  {
    value: "Crowded Optotype Presentation",
    code: "at0254"
  },
  {
    value: "Line Optotype Presentation",
    code: "at0261"
  }
];

/**
 * Chart scoring algorithms from the ADL file
 */
export const CHART_SCORING_ALGORITHMS = [
  {
    value: "Single letter",
    code: "at0100"
  },
  {
    value: "Whole line",
    code: "at0101"
  },
  {
    value: "Last line single letter",
    code: "at0102"
  }
];

/**
 * Patient circumstances affecting result from the ADL file
 */
export const PATIENT_CIRCUMSTANCES = [
  {
    value: "Mydriasis",
    code: "at0195"
  },
  {
    value: "Lid Swelling",
    code: "at0196"
  },
  {
    value: "Blepharospasm",
    code: "at0197"
  },
  {
    value: "Confusion",
    code: "at0198"
  },
  {
    value: "Excentric Fixation",
    code: "at0199"
  },
  {
    value: "Manually holding lid open",
    code: "at0200"
  },
  {
    value: "Uncooperative",
    code: "at0201"
  },
  {
    value: "After anaestheric eyedrop application",
    code: "at0202"
  },
  {
    value: "Good cooperation",
    code: "at0203"
  },
  {
    value: "Lying in Bed",
    code: "at0204"
  }
];

/**
 * Get display values for dropdown
 */
export const CORRECTION_TYPES_DISPLAY = CORRECTION_TYPES.map(item => item.value);
export const CHART_TYPES_DISPLAY = CHART_TYPES.map(item => item.value);
export const TESTING_METHODS_DISPLAY = TESTING_METHODS.map(item => item.value);
export const OPTOTYPE_TYPES_DISPLAY = OPTOTYPE_TYPES.map(item => item.value);
export const QUALITATIVE_MEASURES_DISPLAY = QUALITATIVE_MEASURES.map(item => item.value);

/**
 * All testing parameter options combined (excluding qualitative measures)
 */
export const ALL_PARAMETER_TYPES = [
  ...CORRECTION_TYPES_DISPLAY,
  ...CHART_TYPES_DISPLAY,
  ...TESTING_METHODS_DISPLAY,
  ...OPTOTYPE_TYPES_DISPLAY
];