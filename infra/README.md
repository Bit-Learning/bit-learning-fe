- Default
  - use `inventory` do not need to pass -i inventory (configured in ansible.cfg)
  - use `.vault_pass` do not need to pass --ask-vault-pass (configured in ansible.cfg)

Ping host
```zsh
ansible prod -m ping
```

## Server already install docker, doppler

```zsh
ansible-playbook app_deploy.yml --ask-vault-pass -vv --tags deploy
```

## Bare server

```zsh
ansible-playbook app_deploy_bareserver.yml --tags provision
```

```zsh
ansible-playbook app_deploy_bareserver.yml --tags deploy
# More log
# ansible-playbook app_deploy_bareserver.yml -vv --tags deploy
```

```zsh
ansible-playbook app_deploy_bareserver.yml -vv --tags remove-app
```