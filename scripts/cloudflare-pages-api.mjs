import fs from 'node:fs';

const toml = fs.readFileSync(
  `${process.env.APPDATA}/xdg.config/.wrangler/config/default.toml`,
  'utf8',
);
const token = toml.match(/oauth_token = "([^"]+)"/)?.[1];
if (!token) throw new Error('No wrangler oauth token found');

const accountId = 'd53f5e239245a237a4b9cc7ec499ccad';
const project = 'vegantattoostudios';

async function api(path, method = 'GET', body) {
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  console.log(`${method} ${path} → ${res.status}`);
  console.log(JSON.stringify(json, null, 2));
  return json;
}

const action = process.argv[2] ?? 'get';

if (action === 'get') {
  await api(`/pages/projects/${project}`);
}

if (action === 'patch') {
  await api(`/pages/projects/${project}`, 'PATCH', {
    source: {
      type: 'github',
      config: {
        owner: 'michelborrer',
        repo_name: 'vegantattoostudios',
        production_branch: 'main',
        pr_comments_enabled: true,
        deployments_enabled: true,
        production_deployments_enabled: true,
        preview_deployment_setting: 'all',
        preview_branch_includes: ['*'],
      },
    },
    build_config: {
      build_command: 'npm run build',
      destination_dir: 'dist',
      root_dir: '',
    },
  });
}

if (action === 'patch-build') {
  await api(`/pages/projects/${project}`, 'PATCH', {
    build_config: {
      build_command: 'npm run build',
      destination_dir: 'dist',
      root_dir: '',
    },
  });
}

if (action === 'trigger') {
  await api(`/pages/projects/${project}/deployments`, 'POST', {
    branch: 'main',
  });
}
