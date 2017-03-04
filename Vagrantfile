Vagrant.configure("2") do |config|

  config.vm.box = "ubuntu/xenial64"
  config.ssh.forward_agent = true

  #NODES
  (1..2).each do |i|
    config.vm.define "node#{i}" do |machine|
      machine.vm.network "private_network", ip: "172.17.177.2#{i}"
      machine.vm.provision "shell", inline: <<-SHELL
        locale-gen pt_BR.UTF-8  
      SHELL
      machine.vm.provider "virtualbox" do |v|
        v.memory = 1024
        v.cpus = 1
      end
    end
  end

  #LOAD BALANCE
  config.vm.define 'lb' do |machine|
    machine.vm.network "private_network", ip: "172.17.177.20"
    machine.vm.provider "virtualbox" do |v|
        v.memory = 1024
        v.cpus = 1
    end
    machine.vm.provision "shell", inline: <<-SHELL
        locale-gen pt_BR.UTF-8      
    SHELL
  end

  #CONTROLLER
  config.vm.define 'controller' do |machine|    
    machine.vm.network "private_network", ip: "172.17.177.11"
    machine.vm.provision "shell", inline: <<-SHELL
        apt-add-repository ppa:ansible/ansible
        apt-get update
        locale-gen pt_BR.UTF-8      
        apt-get install -y python2.7 python-simplejson python-pip software-properties-common ansible      
        rm -r /etc/ansible
        pip install 'docker-py>=1.7.0'
        pip install 'docker-compose>=1.7.0'
        ln -s /vagrant/ansible /etc/ansible
        cp /vagrant/.ssh/id_rsa /home/ubuntu/.ssh/id_rsa        
        chown ubuntu:ubuntu /home/ubuntu/.ssh/id_rsa
    SHELL
    #machine.vm.provider "virtualbox" do |v|
        #v.memory = 512
        #v.cpus = 1
    #end
    machine.vm.provision :ansible_local do |ansible|
      ansible.playbook       = "ansible/bootstrap.yml"
      ansible.verbose        = true
      ansible.install        = true
      ansible.limit          = "all" #[all,nodes,node1,node2,controller,lb]
      ansible.inventory_path = "ansible/hosts"
    end
  end

end
