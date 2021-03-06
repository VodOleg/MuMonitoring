const UtilityFunctions = {
    
    /**
     * @description Checks if object is not null and not undefined.
     * @returns false if object is null or undefined else returns true.
     */
    isDefined: (item) => {
        return (item !== null && item !== undefined);
    }, /**
    * 
    * @param {*} obj obj to test
    * @param {*} level first property
    * @param  {...any} rest next properties
    * @returns true if obj.level.rest1.rest2.rest3... defined. false if not
    */
   checkNested: (obj, level,  ...rest) => {
       if (obj === undefined) return false
       if (rest.length === 0 && obj.hasOwnProperty(level)) return true
       return UtilityFunctions.checkNested(obj[level], ...rest)
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
    /**
     * @description stop the execution flow to sleep @timoutMS milliseconds
     * @returns void
     */
    sleep: async (timeoutMS) =>{
        await new Promise(resolve => setTimeout(resolve, timeoutMS));
    },

    /**
     * @description Generates a random number with the amount of digits requested
     * @returns random number with @digitCount amount of digits
     */
    generateKey: (digitsCount) =>{
        let key = "";
        for(let i = 0; i < digitsCount; i++){
            key += Math.floor(Math.random() * 10).toString();
        }
        return key;
    },
    /**
     * @description Searches for @targetObj in @SourceArray comparing with @ComparisonProperty
     * @returns @targetObj from the @SourceArray if found else returns undefined
     */
    getEqivelent: ( SourceArray , targetObj, ComparisonProperty) => {
        var result = SourceArray.find(obj =>{
            return obj[ComparisonProperty] === targetObj[ComparisonProperty];
        });
        return result;
    }

}

module.exports = UtilityFunctions;
