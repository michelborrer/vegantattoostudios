import fs from 'node:fs';

const toml = fs.readFileSync(
  `${process.env.APPDATA}/xdg.config/.wrangler/config/default.toml`,
  'utf8',
);
const token = toml.match(/oauth_token = "([^"]+)"/)?.[1];
if (!token) throw new Error('No wrangler oauth token found');

const accountId = 'd53f5e239245a237a4b9cc7ec499ccad';

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
  if (!json.success) {
    console.log(JSON.stringify(json, null, 2));
  }
  return json;
}

const action = process.argv[2];
const project = 'vegantattoostudios';

if (action === 'inspect') {
  await api('/pages/projects/chiropractic-guide');
}

if (action === 'delete') {
  await api(`/pages/projects/${project}`, 'DELETE');
}

if (action === 'create') {
  await api('/pages/projects', 'POST', {
    name: project,
    production_branch: 'main',
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
      destination_dir: 'dist/client',
      root_dir: '',
    },
  });
}

if (action === 'recreate') {
  console.log('Deleting direct-upload project...');
  const del = await api(`/pages/projects/${project}`, 'DELETE');
  if (!del.success) process.exit(1);
  console.log('Creating Git-connected project...');
  const created = await api('/pages/projects', 'POST', {
    name: project,
    production_branch: 'main',
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
      destination_dir: 'dist/client',
      root_dir: '',
    },
  });
  if (!created.success) process.exit(1);
  console.log('Done. Cloudflare will build from GitHub on create.');
}
