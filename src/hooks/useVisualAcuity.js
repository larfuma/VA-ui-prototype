import { useState, useEffect } from 'react';
import { parseResultInput, parseDistanceInput, parseTestParameterInput } from '../utils/parsers';
import { formatEyeEvent } from '../utils/formatters';
import { OFFICIAL_CODED_ENTRIES } from '../constants/codedValues';
import { CORRECTION_TYPES, CORRECTION_TYPES_DISPLAY, ALL_PARAMETER_TYPES } from '../constants/correctionTypes';

/**
 * Custom hook to manage visual acuity state for a single eye
 * @param {string} eye - 'right' or 'left'
 * @param {number} index - Index for the OpenEHR template (0 for right, 1 for left)
 * @returns {Object} - State and methods for managing visual acuity data
 */
export function useVisualAcuity(eye, index) {
  // State for input values
  const [value, setValue] = useState('');
  const [testParameter, setTestParameter] = useState('');
  const [corrections, setCorrections] = useState([]);
  
  // State for parsed results
  const [parsedResult, setParsedResult] = useState(null);
  const [parsedTestParameter, setParsedTestParameter] = useState(null);
  
  // State for recorded parameters (chart type, method, optotype, distance)
  const [testParameters, setTestParameters] = useState({
    chartType: null,
    method: null,
    optotype: null,
    distance: null
  });
  
  // State to track if user has explicitly removed the distance
  const [userRemovedDistance, setUserRemovedDistance] = useState(false);
  
  // State for previous result type
  const [previousResultType, setPreviousResultType] = useState(null);
  
  // State for autocomplete suggestions
  const [vaSuggestions, setVASuggestions] = useState([]);
  
  // State for formatted data
  const [formattedData, setFormattedData] = useState({});

  // Parse VA value when it changes
  useEffect(() => {
    const newParse = parseResultInput(value);
    setParsedResult(newParse);
  }, [value]);

  // Parse test parameter when it changes
  useEffect(() => {
    if (testParameter) {
      const newParse = parseTestParameterInput(testParameter, ALL_PARAMETER_TYPES);
      setParsedTestParameter(newParse);
    } else {
      setParsedTestParameter(null);
    }
  }, [testParameter]);

  // Update VA suggestions when value changes
  useEffect(() => {
    if (!value) {
      setVASuggestions([]);
      return;
    }
    
    const lower = value.toLowerCase();
    const filtered = OFFICIAL_CODED_ENTRIES.filter((entry) =>
      entry.toLowerCase().includes(lower)
    );
    setVASuggestions(filtered);
  }, [value]);
  
  // Reset the userRemovedDistance flag when the input changes completely
  useEffect(() => {
    // Only reset if the value has substantially changed (e.g., completely different input)
    // This allows for minor edits without resetting the flag
    if (!value || value.length < 2) {
      setUserRemovedDistance(false);
    }
  }, [value]);

  // Update distance based on parsed result, but respect user removal
  useEffect(() => {
    if (!parsedResult?.valid) return;

    // Check if the result type has changed
    const resultTypeChanged = parsedResult.type !== previousResultType;
    
    // Update previous result type
    if (parsedResult.type !== previousResultType) {
      setPreviousResultType(parsedResult.type);
      
      // Reset user removal flag when result type changes completely
      if (resultTypeChanged && previousResultType) {
        setUserRemovedDistance(false);
      }
    }
    
    // Only update distance if:
    // 1. User hasn't explicitly removed it AND
    // 2. Either (a) result type has changed OR (b) there is no distance set
    if (!userRemovedDistance && 
        parsedResult.Distance && 
        (resultTypeChanged || !testParameters.distance)) {
      setTestParameters(prev => ({ 
        ...prev, 
        distance: {
          magnitude: parsedResult.Distance.magnitude,
          unit: parsedResult.Distance.unit,
          source: parsedResult.Distance.explicit ? 'explicit' : 'default'
        }
      }));
    }
  }, [parsedResult, previousResultType, testParameters.distance, userRemovedDistance]);

  // Track distance from test parameter field only
  useEffect(() => {
    if (parsedTestParameter?.type === 'distance' && parsedTestParameter.valid) {
      setTestParameters(prev => ({ 
        ...prev, 
        distance: {
          magnitude: parsedTestParameter.magnitude,
          unit: parsedTestParameter.unit,
          source: 'explicit'
        }
      }));
      // Reset user removed flag since they're explicitly setting a distance
      setUserRemovedDistance(false);
      setTestParameter(''); // Clear after recording
    }
  }, [parsedTestParameter, setTestParameter]);

  // Handle special parameter types (method, chart type, optotype)
  useEffect(() => {
    if (parsedTestParameter?.valid && parsedTestParameter.type !== 'distance') {
      switch (parsedTestParameter.type) {
        case 'chartType':
          setTestParameters(prev => ({ ...prev, chartType: parsedTestParameter.value }));
          setTestParameter(''); // Clear after recording
          break;
        case 'method':
          setTestParameters(prev => ({ ...prev, method: parsedTestParameter.value }));
          setTestParameter(''); // Clear after recording
          break;
        case 'optotype':
          setTestParameters(prev => ({ ...prev, optotype: parsedTestParameter.value }));
          setTestParameter(''); // Clear after recording
          break;
        default:
          // Don't clear other parameter types here
          break;
      }
    }
  }, [parsedTestParameter, setTestParameter]);

  // Format the data when parsed results change
  useEffect(() => {
    if (parsedResult?.valid) {
      const newData = formatEyeEvent(
        index, 
        parsedResult, 
        eye, 
        null, // Don't pass distance this way anymore
        value, 
        corrections,
        testParameters
      );
      
      setFormattedData(newData);
    } else {
      setFormattedData({});
    }
  }, [parsedResult, eye, index, value, corrections, testParameters]);

  // Auto-clear test parameter input if explicit distance is detected in VA input
  useEffect(() => {
    if (parsedResult?.Distance?.explicit && 
        testParameter && 
        parsedTestParameter?.type === 'distance') {
      setTestParameter('');
    }
  }, [parsedResult, testParameter, parsedTestParameter]);

  // Add a correction when a correction type is selected
  useEffect(() => {
    if (parsedTestParameter?.type === 'correction' && 
        corrections.length < 2 && 
        !corrections.some(c => c.type === parsedTestParameter.value)) {
      
      // Find the correction type details from the constant
      const correctionTypeDetails = CORRECTION_TYPES.find(ct => ct.value === parsedTestParameter.value);
      
      // Add the correction with lens specification requirement info
      setCorrections([...corrections, {
        id: Date.now(),
        type: parsedTestParameter.value,
        sphere: '',
        cylinder: '',
        axis: '',
        requiresLensSpecification: correctionTypeDetails ? correctionTypeDetails.requiresLensSpecification : true
      }]);
      // Clear the test parameter input
      setTestParameter('');
    }
  }, [parsedTestParameter, corrections, setTestParameter]);

  // Handle selecting a suggestion from autocomplete
  const handleSelectSuggestion = (suggestion) => {
    setValue(suggestion);
  };

  // Handle key press - validation and accepting suggestions
  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && vaSuggestions.length === 1) {
      event.preventDefault();
      setValue(vaSuggestions[0]);
    }
  };

  // Clear a specific test parameter
  const clearTestParameter = (paramType) => {
    setTestParameters(prev => ({ ...prev, [paramType]: null }));
    
    // If the user is removing distance, set the flag to prevent it from coming back
    if (paramType === 'distance') {
      setUserRemovedDistance(true);
    }
  };

  // Process the test parameter on Enter key press
  const handleTestParameterEnter = (value) => {
    if (!value) return;
    
    // Only process if not disabled (which happens when distance is explicit in VA)
    if (parsedResult?.Distance?.explicit) return;
    
    // Process the parameter
    if (parsedTestParameter?.valid) {
      if (parsedTestParameter.type === 'distance') {
        // Handle distance parameter
        setTestParameters(prev => ({ 
          ...prev, 
          distance: {
            magnitude: parsedTestParameter.magnitude,
            unit: parsedTestParameter.unit,
            source: 'explicit'
          }
        }));
        // User is explicitly setting a distance, so reset the removal flag
        setUserRemovedDistance(false);
        setTestParameter(''); // Clear after recording
      }
    }
  };

  return {
    // Input values
    value,
    setValue,
    testParameter,
    setTestParameter,
    corrections,
    setCorrections,
    
    // Parsed results
    parsedResult,
    parsedTestParameter,
    
    // Test parameters (chart type, method, optotype)
    testParameters,
    clearTestParameter,
    handleTestParameterEnter,
    
    // Formatted data for OpenEHR
    formattedData,
    
    // Autocomplete
    vaSuggestions,
    correctionTypes: ALL_PARAMETER_TYPES,
    handleSelectSuggestion,
    handleKeyPress,
    
    // Utility states
    isTestParameterDisabled: parsedResult?.Distance?.explicit || false,
    isValid: parsedResult?.valid || false,
    errorMessage: parsedResult?.error || '',
    isTestParameterValid: !parsedTestParameter || parsedTestParameter.valid,
    testParameterErrorMessage: parsedTestParameter?.error || ''
  };
}