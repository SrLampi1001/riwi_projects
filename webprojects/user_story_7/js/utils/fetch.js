export const API_URL = 'http://localhost:3000';
export default async function fetchAPI(url, options = { headers: {'Content-Type': 'application/json'}, method: 'GET' }){
    try{
        const response = await fetch(`${API_URL}${url}`, options);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    } catch(error){
        console.error(error);
        return error;
    }
}