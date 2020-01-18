# Contributing

### Install the development environment

```bash
apt-get install git curl yarn
# or
brew install git curl yarn
```

_node & npm & yarn_

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.2/install.sh | bash
nvm install 12
nvm use 12
```

Get the project

```bash
git clone git@github.com:teamstarter/node-jobs.git
cd node-jobs
yarn
yarn start
```

### Be able to run bin files from the local node\_modules folder

```bash
vim ~/.bashrc
#Add at the end of the file:
alias npm-exec='PATH=$(npm bin):$PATH'
npm-exec
:wq #Then save and quit
source ~/.bashrc
```

### Test the migration script locally

```bash
yarn run gnj migrate ./../tests/sqliteTestConfig.js
```

### Start a test server using the test database migrated previously

```bash
yarn start
```

### Running the test

```bash
yarn test
```

Debugging a specific test

```bash
node --inspect-brk ./node_modules/jest/bin/jest.js ./tests/job.spec.js
```

