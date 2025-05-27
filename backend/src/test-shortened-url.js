// Test script for resolving shortened Amazon URLs
import fetch from 'node-fetch';
import axios from 'axios';

// The Amazon shortened URL to test
const TEST_URL = 'https://a.co/d/93pZDDC';

async function resolveShortUrl(url) {
  console.log(`Testing resolution of shortened URL: ${url}`);
  
  // Method 1: Using fetch API (simpler and more direct)
  try {
    console.log('\n1. Trying with fetch API (follow redirects)...');
    const fetchResponse = await fetch(url, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    const finalUrl = fetchResponse.url;
    console.log('Final URL from fetch:', finalUrl);
    
    if (finalUrl && (finalUrl.includes('amazon.com') || finalUrl.includes('amazon.com.mx'))) {
      console.log('SUCCESS: Resolved to Amazon URL with fetch method!');
      return finalUrl;
    }
    
    // If fetch didn't resolve to an Amazon URL, try to extract from HTML response
    console.log('Fetch did not resolve to Amazon URL, attempting to extract from HTML response...');
    const htmlContent = await fetchResponse.text();
    
    // Look for possible Amazon URL in the HTML
    const amazonUrlMatch = htmlContent.match(/https:\/\/(?:www\.)?amazon\.com(?:\.mx)?\/[^\s"']+/i);
    if (amazonUrlMatch) {
      const extractedUrl = amazonUrlMatch[0].replace(/\\/g, '');
      console.log('Found Amazon URL in HTML response:', extractedUrl);
      
      if (extractedUrl.includes('amazon.com') || extractedUrl.includes('amazon.com.mx')) {
        console.log('SUCCESS: Extracted Amazon URL from HTML with fetch method!');
        return extractedUrl;
      }
    }
    
    console.log('Fetch method could not extract Amazon URL, trying axios method...');
  } catch (fetchError) {
    console.error('Error with fetch method:', fetchError.message);
    console.log('Fetch method failed, falling back to axios method...');
  }
  
  // Method 2: Using axios to get the full HTML and analyze it
  try {
    console.log('\n2. Trying with axios GET request...');
    const axiosResponse = await axios.get(url, {
      maxRedirects: 15,
      timeout: 15000,
      validateStatus: function (status) {
        return status >= 200 && status < 400;
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    console.log('Axios request completed with status:', axiosResponse.status);
    
    // Check the final URL from axios
    if (axiosResponse.request && axiosResponse.request.res && axiosResponse.request.res.responseUrl) {
      const responseUrl = axiosResponse.request.res.responseUrl;
      console.log('Axios response URL:', responseUrl);
      
      if (responseUrl.includes('amazon.com') || responseUrl.includes('amazon.com.mx')) {
        console.log('SUCCESS: Found Amazon URL from axios response!');
        return responseUrl;
      }
    }
    
    // Analyze the HTML to find Amazon URL
    const html = axiosResponse.data;
    console.log('Got HTML response, content length:', html.length);
    
    // Various strategies to find the correct URL
    let amazonUrl = '';
    
    // Strategy 1: Search for canonical link
    const canonicalMatch = html.match(/<link rel="canonical" href="([^"]+)"/i);
    if (canonicalMatch && canonicalMatch[1]) {
      amazonUrl = canonicalMatch[1];
      console.log('Found canonical URL:', amazonUrl);
      if (amazonUrl.includes('amazon.com') || amazonUrl.includes('amazon.com.mx')) {
        console.log('SUCCESS: Found Amazon URL in canonical link!');
        return amazonUrl;
      }
    }
    
    // Strategy 2: Search for meta redirect
    const metaRedirectMatch = html.match(/<meta http-equiv="refresh" content="[^"]*url=([^"]+)"/i);
    if (metaRedirectMatch && metaRedirectMatch[1]) {
      amazonUrl = metaRedirectMatch[1];
      console.log('Found meta redirect URL:', amazonUrl);
      if (amazonUrl.includes('amazon.com') || amazonUrl.includes('amazon.com.mx')) {
        console.log('SUCCESS: Found Amazon URL in meta redirect!');
        return amazonUrl;
      }
    }
    
    // Strategy 3: Search for any Amazon URL in the content with improved pattern
    const amazonUrlMatches = html.match(/https:\/\/(?:www\.)?amazon\.com(?:\.mx)?\/[^\s"'<>]+/ig);
    if (amazonUrlMatches && amazonUrlMatches.length > 0) {
      // Prioritize URLs that look like product URLs (contain dp/ or gp/product/)
      const productUrlMatch = amazonUrlMatches.find(url => 
        url.includes('/dp/') || url.includes('/gp/product/'));
        
      if (productUrlMatch) {
        amazonUrl = productUrlMatch.replace(/\\/g, '');
        console.log('Found Amazon product URL in HTML content:', amazonUrl);
        console.log('SUCCESS: Found Amazon product URL in HTML content!');
        return amazonUrl;
      } else {
        // If no product URL, use the first Amazon URL
        amazonUrl = amazonUrlMatches[0].replace(/\\/g, '');
        console.log('Found Amazon URL in HTML content:', amazonUrl);
        console.log('SUCCESS: Found Amazon URL in HTML content!');
        return amazonUrl;
      }
    }
    
    // Strategy 4: Extract ASIN from HTML and construct URL
    const asinMatch = html.match(/(?:ASIN|asin|productId|product-id|productID)(?:\s*[=:]\s*["']?)([A-Z0-9]{10})["']?/i);
    if (asinMatch && asinMatch[1]) {
      const asin = asinMatch[1];
      console.log('Extracted ASIN from HTML:', asin);
      amazonUrl = `https://www.amazon.com.mx/dp/${asin}`;
      console.log('Constructed Amazon URL from ASIN:', amazonUrl);
      console.log('SUCCESS: Built Amazon URL from ASIN!');
      return amazonUrl;
    }
    
    // If we got here, check if there's a CAPTCHA or other issues
    if (html.includes('Type the characters you see in this image') || 
        html.includes('Enter the characters you see below') ||
        html.includes('Sorry, we just need to make sure you') ||
        html.includes('robot') || 
        html.includes('captcha')) {
      console.log('DETECTED: Amazon is showing a CAPTCHA verification page!');
      console.log('Preview of HTML:', html.substring(0, 300) + '...');
    }
    
    console.log('FAILED: Could not find Amazon URL in HTML content');
    return null;
  } catch (error) {
    console.error('Error resolving shortened URL with axios:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
    }
    return null;
  }
}

// Run the test
(async () => {
  try {
    const resolvedUrl = await resolveShortUrl(TEST_URL);
    if (resolvedUrl) {
      console.log('\nTEST SUCCESS! Resolved URL:', resolvedUrl);
    } else {
      console.log('\nTEST FAILED! Could not resolve the shortened URL.');
    }
  } catch (error) {
    console.error('\nTEST ERROR:', error);
  }
})(); 