const sanytizeString = (str, neutralizeScripts = true, sanitizeAttributes = true)=>{
    if(typeof str !== 'string') return null;
    try{
        if (typeof window === 'undefined') {
            throw new Error('DOM method only works in browser environments');
        }
        const div = document.createElement('div');
        div.textContent = str; //The browser automatically escapes all
        return div.innerHTML;
    }catch(error){
        console.error(error)
        console.warn("trying manual method...")
        let escaped = str
        .replace(/&/g, '&amp;') 
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
        // Advanced protection against script injection
        if (neutralizeScripts) {
        // Neutralize script tags by breaking them up
        escaped = escaped
            .replace(/<script/gi, '&lt;&#x73;cript')
            .replace(/<\/script/gi, '&lt;&#x2F;&#x73;cript')
            .replace(/on\w+\s*=/gi, '&#x6F;n&#x200B;=') // Break event handlers
            .replace(/javascript:/gi, '&#x6A;avascript:');
        }
        // Sanitize dangerous attributes and patterns
        if (sanitizeAttributes) {
        // Remove or neutralize data URLs, vbscript, etc.
            escaped = escaped
            .replace(/data:text\/html/gi, '&#x64;ata:text&#x2F;html')
            .replace(/vbscript:/gi, '&#x76;bscript:')
            .replace(/onerror\s*=/gi, '&#x6F;nerror&#x200B;=')
            .replace(/onload\s*=/gi, '&#x6F;nload&#x200B;=');
        }
        return escaped;
    }
}
export {sanytizeString}