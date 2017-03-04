docker-cadvisor
============

[![Build Status](https://travis-ci.org/wangsha/docker-cadvisor.svg?branch=master)](https://travis-ci.org/wangsha/docker-cadvisor)
[![Ansible Galaxy](https://img.shields.io/badge/AnsibleGalaxy-wangsha.docker--cadvisor-blue.svg)](https://galaxy.ansible.com/wangsha/docker-cadvisor/)

Ansible role to manage and run the cadvisor docker container.

Requirements
------------

This role has only been tested on Ubuntu 14.04. Since this uses Ansible's
docker module, you will need to ensure that a recent-ish version of `docker-py`
and `docker` are installed. 

`ansible>=2.0.0.0,<=2.1.0.0`

Examples
--------

Install this module from Ansible Galaxy into the './roles' directory:
```bash
ansible-galaxy install wangsha.docker-cadvisor -p ./roles
```

Use it in a playbook as follows, assuming you already have docker setup:
```yaml
- hosts: 'servers'
  roles:
    - role: angstwad.docker_ubuntu
      become: true
    - role: wangsha.docker-influxdb
    - role: wangsha.docker-cadvisor
      become: true
      docker_cadvisor_links:
        - "influxdb:influxdb"
      docker_cadvisor_command: "-storage_driver=influxdb -storage_driver_db=cadvisor -storage_driver_host=influxdb:8086"
```

Have a look at the [defaults/main.yml](defaults/main.yml) for role variables
that can be overridden.

If you need a playbook to set Docker itself, have a look at [angstwad.docker_ubuntu](https://github.com/angstwad/docker.ubuntu) Galaxy
role.


License
-------

[MIT](LICENSE.txt)

Author Information
------------------

- wangsha
