BASE_URL = "https://demo.inelabteamdev.com";

async function sample_function_2() {
    const item_id = 2030;
    const ITEM_ID_URL = `${BASE_URL}/api/v2/items/${item_id}`;
    const res = await fetch(ITEM_ID_URL, {
        headers:{
            "accept": "application/json",
        }
    });
    const data = await res.text();
    console.dir(JSON.parse(data));
}


sample_function_2();

// OUTPUT
// {
//   id: 2030,
//   slug: 'solvane-spin-bike-one',
//   name: 'Solvane Spin Bike One',
//   brand: 'Solvane',
//   category: 'Fitness',
//   sku: 'SK-2030-SO',
//   description: 'The Solvane Spin Bike One. A dependable fitness pick with a clean, no-nonsense design and the everyday features you actually use.',
//   specs: {
//     warranty: '2 years manufacturer warranty',
//     inTheBox: 'Spin Bike, Anchor strap, Grip pads, Storage bag, Care card',
//     countryOfOrigin: 'Czechia',
//     returns: '15-day replacement, unopened',
//     support: '24×7 chat support',
//     weightGrams: 1386,
//     material: 'TPE foam',
//     colour: 'Bone White',
//     modelYear: 2023
//   },
//   reviews: [ARRAY OF REVIEWS],
//   optionAxis: 'Level',
//   options: [
//     { id: 'o1', label: 'Starter' },
//     { id: 'o2', label: 'Regular' },
//     { id: 'o3', label: 'Advanced' },
//     { id: 'o4', label: 'Elite' }
//   ]
// }

