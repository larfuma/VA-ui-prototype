{
    // =============================
    // Mandatory Composition Metadata
    // =============================
    "va_split_position/category|code": "433",
    "va_split_position/category|terminology": "openehr",
    "va_split_position/category|value": "event",
  
    // Start time left blank for user input
    "va_split_position/context/start_time": "",
  
    // Minimal mandatory "language" and "territory"
    "va_split_position/language|code": "en",
    "va_split_position/language|terminology": "ISO_639-1",
    "va_split_position/territory|code": "DE",
    "va_split_position/territory|terminology": "ISO_3166-1",
  
    // Composer name left blank
    "va_split_position/composer|name": "",
  
    // =============================
    // Observation: Visual Acuity Test
    // =============================
    "va_split_position/visual_acuity_test_result/any_event": [
      {
        // No default eye chosen
        "eye_s_examined|value": "",
        "eye_s_examined|code": "",
        "eye_s_examined|terminology": "local",
  
        // Result (coded text) left blank
        "result_details/result/coded_text_value|value": "",
        "result_details/result/coded_text_value|code": "",
        "result_details/result/coded_text_value|terminology": "local",
  
        // Force logMAR as the default notation
        "result_details/unit_of_result|value": "logMAR",
        "result_details/unit_of_result|code": "at0165",
        "result_details/unit_of_result|terminology": "local",
  
        // By default, we assume a result is available
        "result_details/no_test_result": false
      }
    ],
  
    // Mandatory language/encoding for the OBSERVATION
    "va_split_position/visual_acuity_test_result/language|code": "en",
    "va_split_position/visual_acuity_test_result/language|terminology": "ISO_639-1",
    "va_split_position/visual_acuity_test_result/encoding|code": "UTF-8",
    "va_split_position/visual_acuity_test_result/encoding|terminology": "IANA_character-sets"
  }
  