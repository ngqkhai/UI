// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
    // Collection endpoints
    uploadFile: `${API_BASE_URL}/api/collections/upload-file`,
    wikipedia: `${API_BASE_URL}/api/collections/wikipedia`,
    collections: `${API_BASE_URL}/api/collections`,
    collection: (id: string) => `${API_BASE_URL}/api/collections/${id}`,
    
    // Script endpoints
    createScript: `${API_BASE_URL}/api/scripts`,
    scriptStatus: (id: string) => `${API_BASE_URL}/api/scripts/${id}/status`,
    script: (id: string) => `${API_BASE_URL}/api/scripts/${id}`,
    scriptByCollection: (collectionId: string) => `${API_BASE_URL}/api/collections/${collectionId}/scripts`,
    
    // Configuration endpoints
    styles: `${API_BASE_URL}/api/configurations/styles`,
    languages: `${API_BASE_URL}/api/configurations/languages`,
    voices: `${API_BASE_URL}/api/configurations/voices`,
    visualStyles: `${API_BASE_URL}/api/configurations/visual-styles`,
    targetAudiences: `${API_BASE_URL}/api/configurations/target-audiences`,
    durations: `${API_BASE_URL}/api/configurations/durations`,
    
    // Voice synthesis
    voiceSynthesize: `${API_BASE_URL}/api/v1/voice/synthesize`,
    
    // Visuals generation
    visuals: `${API_BASE_URL}/api/visuals`,
} as const; 