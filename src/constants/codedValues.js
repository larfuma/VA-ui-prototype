/**
 * The official mapping from the archetype's local text to 
 * the correct code system + code from term_binding
 */
export const officialCodedMap = {
  "HM - Hand movement": {
    archetypeNode: "at0152",
    codeSystem: "SNOMED-CT",
    codeString: "260295004",
    approximateLogMAR: 2.3
  },
  "CF - Count fingers": {
    archetypeNode: "at0153",
    codeSystem: "LOINC",
    codeString: "LA24679-5",
    approximateLogMAR: 1.9
  },
  "PL - Perceives Light": {
    archetypeNode: "at0154",
    codeSystem: "SNOMED-CT",
    codeString: "260296003"
    // no approximate logMAR
  },
  "PLAP - Perceives Light, accurate Projection": {
    archetypeNode: "at0155",
    codeSystem: "SNOMED-CT",
    codeString: "260297007"
  },
  "PLIP - Perceives Light, inaccurate Projection": {
    archetypeNode: "at0156",
    codeSystem: "SNOMED-CT",
    codeString: "260298002"
  },
  "NPL - No Light Perception": {
    archetypeNode: "at0161",
    codeSystem: "SNOMED-CT",
    codeString: "63063006"
  },
  "CSM - Central Steady Maintained Fixation": {
    archetypeNode: "at0157",
    codeSystem: "LOINC",
    codeString: "LA25490-6"
  },
  "CUM - Central Unsteady Maintained Fixation": {
    archetypeNode: "at0158",
    codeSystem: "LOINC",
    codeString: "LA25491-4"
  },
  "FF - Fix and Follow": {
    archetypeNode: "at0159",
    codeSystem: "LOINC",
    codeString: "LA25492-2"
  },
  "BFL - Blinks for Light": {
    archetypeNode: "at0160",
    codeSystem: "LOINC",
    codeString: "LA25493-0"
  },
  "OtO - Objection to Occlusion": {
    archetypeNode: "at0260",
    codeSystem: "local",
    codeString: "at0260"
  },
  "NI - No Improvement": {
    archetypeNode: "at0280",
    codeSystem: "local",
    codeString: "at0280"
  }
};

// Export a list of all coded entry keys for easier access
export const OFFICIAL_CODED_ENTRIES = Object.keys(officialCodedMap);

// Additional sample suggestions for autocomplete
export const RELEVANT_CODED_DISPLAYS = [
  ...OFFICIAL_CODED_ENTRIES,
  "6/6", "20/40ft", "0.3dec", "5", "0.18", "N8", "2J"
];
