import next from 'eslint-config-next'

const eslintConfig = [
  { ignores: ['.next/**', 'node_modules/**', 'design_handoff/**'] },
  ...next,
]

export default eslintConfig
