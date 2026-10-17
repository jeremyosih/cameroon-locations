async function checkMissingData(): Promise<void> {
  const file = Bun.file('./cameroon_locations_complete.json');
  const data = await file.json();

  console.log('Checking for missing area or pcode data...\n');

  let missingArea: string[] = [];
  let missingPcode: string[] = [];

  data.subdivisions.forEach((sub: any, index: number) => {
    if (!sub.area) {
      missingArea.push(`${index + 1}. ${sub.nameFr} (code: ${sub.code})`);
    }
    if (!sub.pcode) {
      missingPcode.push(`${index + 1}. ${sub.nameFr} (code: ${sub.code})`);
    }
  });

  console.log(`Missing AREA data (${missingArea.length}):`);
  missingArea.forEach(item => console.log(item));

  console.log(`\nMissing PCODE data (${missingPcode.length}):`);
  missingPcode.forEach(item => console.log(item));

  console.log(`\nTotal subdivisions: ${data.subdivisions.length}`);
  console.log(`With area: ${data.subdivisions.length - missingArea.length}`);
  console.log(`With pcode: ${data.subdivisions.length - missingPcode.length}`);
}

if (import.meta.main) {
  checkMissingData();
}