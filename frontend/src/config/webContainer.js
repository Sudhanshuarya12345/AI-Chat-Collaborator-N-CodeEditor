import { WebContainer } from '@webcontainer/api';

let webContainerInstance = null;
let initializationPromise = null;

const initializeWebContainer = async () => {
    try {
        const container = await WebContainer.boot({
            workdirName: 'workspace',
        });
        
        // Initialize the file system with a basic structure
        await container.mount({
            'package.json': {
                file: {
                    contents: JSON.stringify({
                        name: 'workspace',
                        version: '1.0.0',
                        type: 'module'
                    }, null, 2)
                }
            }
        });

        return container;
    } catch (error) {
        console.error('Failed to initialize WebContainer:', error);
        throw error;
    }
};

export const getWebContainer = async () => {
    // If we already have an instance, return it
    if (webContainerInstance) {
        return webContainerInstance;
    }

    // If we're in the process of initializing, return the promise
    if (initializationPromise) {
        return initializationPromise;
    }

    // Start initialization
    initializationPromise = initializeWebContainer()
        .then(container => {
            webContainerInstance = container;
            return container;
        })
        .catch(error => {
            // Reset initialization state on error
            webContainerInstance = null;
            initializationPromise = null;
            throw error;
        });

    return initializationPromise;
};

// Reset function for testing/development
export const resetWebContainer = () => {
    webContainerInstance = null;
    initializationPromise = null;
};