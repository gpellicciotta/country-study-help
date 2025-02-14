# Resources

- Flags in SVG format: https://github.com/lipis/flag-icons  
  Downloaded and put `in img/flags`

- Translations via Google translate:
  1. First going to the english Country site, and then 
  2. Finding the Dutch and Italian translations

- Country maps on the globe, also via Wikipedia, by:
  1. First going to the country page
  2. Then finding the image page (looking for `<a href='...>'<img src='...'>...</a>`)
  3. Then looking for the `<a href='...svg'>Original file</a>` link
  4. Downloading the image to the `data/maps/{country-code}.svg`

# A.I. Prompts

The AI prompts used:

Objective: Create a CSV format that lists countries, their capitals, Wikipedia and pronunciation links in English, Dutch, and Italian when available.

CSV Format Structure:

Columns:
- 2-letter-country-code
- Country in English
- Capital in English
- Wikipedia link to English article
- Country in Dutch
- Capital in Dutch
- Wikipedia link to Dutch article
- Country in Italian
- Capital in Italian
- Wikipedia link to Italian article

Create a full list: don't stop if there are still countries left.
Don't include links if the target URL doesn't exist.

Please list all the countries and list them in alphabetical order.