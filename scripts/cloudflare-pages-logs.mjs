import fs from 'node:fs';

const toml = fs.readFileSync(
  `${process.env.APPDATA}/xdg.config/.wrangler/config/default.toml`,
  'utf8',
);
const token = toml.match(/oauth_token = "([^"]+)"/)?.[1];
const accountId = 'd53f5e239245a237a4b9cc7ec499ccad';
const project = 'vegantattoostudios';
const deploymentId = process.argv[2] ?? 'e8461cd9-5b38-4348-a038-5140ead8b1bf';

const res = await fetch(
  `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/${project}/deployments/${deploymentId}/history/logs`,
  { headers: { Authorization: `Bearer ${token}` } },
);
const json = await res.json();
if (json.result?.data) {
  for (const line of json.result.data) {
    console.log(line);
  }
} else {
  console.log(JSON.stringify(json, null, 2));
}
