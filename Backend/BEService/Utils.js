const UtilityFunctions = {
    
    /**
     * @description Checks if object is not null and not undefined.
     * @returns false if object is null or undefined else returns true.
     */
    isDefined: (item) => {
        return (item !== null && item !== undefined);
    },

    /**
     * @param value the object to test
     * @description Checks if @value is a string
     * @returns true f object is a string
     */
    isString: (value) => {
        return (typeof value === 'string' || value instanceof String);
    },

    /**
     * @description Checks if the object is a non empty string
     * @returns True if object is non empty string
     */
    isNonEmptyString : (item) =>{
        
        return (UtilityFunctions.isDefined(item) && UtilityFunctions.isString(item) && item !== "" && item !== '')
    },

    sleep: async (timeoutMS) =>{
        await new Promise(resolve => setTimeout(resolve, timeoutMS));
    }

}

module.exports = UtilityFunctions;
