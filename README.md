Conceito:

*   Ambiente de teste para a simulação de servidores na nuvem, seguindo o estilo de  arquitetura da Amazon 

*   O ambiente é instanciado e controlado por maquinas virtuais e somente o uso do comando    $vagrant up o ecosistema é instalado e configurado. O ecosistema consiste em duas maquinas de aplicação, uma para o controller (ansible) e outra para o load balancer.
 
*   O deploy da aplicação esta utilizando imagens do docker para instanciar a aplicação nos servidores. A automação do docker trabalha com tags e ja faz a abstração de versões caso seja necessario relalizar algum rollback, basta fazer o deploy com a versão desejada. 

------------------------------------------------------------------

Modos de uso:

    Requisitos:    
        Virtual box
        Vagrant 
        Chave de usuario criptogravada (id_rsa)
        Linux Debian 16.04

Obs. No estado atual de desenvolvimento é necessário a utilização da chave privada do usuário da maquina para fazer a comunicação entre os servidores vagrant.

    sh start.sh          

Bootstrap:
O vagrant inicializa e provisiona os servidores automaticamente, o unico requisito necessário para a automaçao do processo de inicialização é ter um usuário com a chave id_rsa na pasta ~/.ssh/

Ao executar o script shell "start.sh" vai ser copiado a chave privada do usuário e gravada na pasta .ssh do projeto, e em seguida o vagrant inicia o processo boot dos servidores, este processo demora um pouco e depende da internet do usuário. 

Após o vagrant configurar as maquinas virtuais, vai iniciar automaticamente o processo de bootstrap pelo ansible, instalando e configurando a aplicação, cAdvisor, e nginx

Ao termino do bootstrap a aplicação vai estar disponível pelo ip interno 172.17.177.20, caso necessário este ip pode ser alterado mas precisam ser alterados algumas configurações de host do Ansible. 


Funcionamento: 
A aplicação recebe o acesso pelo lb(load balance) e redireciona o acesso para os servidores de aplicação, o lb recebe o protocolo 80 e chama a aplicação pela porta 3000. 


Bootstrap:

    #Acessar o ssh do controller
    vagrant ssh controller
    
    #Abrir a pasta do ansible
    cd /etc/ansible
    
    #Bootstrap de todos os nodes
    ansible-playbook -l nodes bootstrap.yml
    
    #Bootstrap de um node
    ansible-playbook -l node1 bootstrap.yml
    #ou
    ansible-playbook -l node2 bootstrap.yml
    
    #Bootstrap do lb
    ansible-playbook -l lb bootstrap.yml


Exemplo:

    #Após fazer o bootstrap inicial, vamos deletar o node2
    vagrant destroy node2
    
    #Iniciamos a maquina node2 e aguarde
    vagrant up node2
    
    #Acessamos o controller para instalar o aplicação no node2
    vagrant ssh controller
    cd /etc/ansible    
    #Executa a instalação da aplicação
    ansible-playbook -l node2 bootstrap.yml

Deploy:

    #Acessar o ssh do controller
    vagrant ssh controller
    
    #Abrir a pasta do ansible
    cd /etc/ansible
    
    #Executar o deploy da versão de desenvolvimento em todos os nodes da aplicação
    ansible-playbook deploy.yml
    
    #Executar o deploy da versão de desenvolvimento em apenas um node
    ansible-playbook -l node1 deploy.yml


Rollback:
    
    #Acessar o ssh do controller
    vagrant ssh controller
    
    #Abrir a pasta do ansible
    cd /etc/ansible
    
    #Executar o Rollback da versão de desenvolvimento em todos os nodes da aplicação
    ansible-playbook rollback.yml
    
    #Executar o Rollback da versão de desenvolvimento em apenas um node
    ansible-playbook -l node1 rollback.yml
    

Cron de monitoramento do docker da aplicação, os logs de erro e iteração são armazenados em um arquivo dentro da pasta cron com o mesmo nome do script, mudando o final para .log:

    #Acessar o ssh do controller
    vagrant ssh controller
    
    #Executar o script
    sh /vagrant/cron/appcheck.sh
    
    #Executar via ansible
    ansible-playbook //etc//ansible//app_check.yml
    
Cron de envio de relatorio, os logs de erro e iteração são armazenados em um arquivo dentro da pasta cron com o mesmo nome do script, mudando o final para .log:
Configuração do email deve ser feita no arquivo /ansible/sendreport.yml

    #Acessar o ssh do controller
    vagrant ssh controller

    #Executar o script
    sh /vagrant/cron/appcheck.sh
    
    #Executar via ansible
    ansible-playbook //etc//ansible//sendreport.yml

Monitoramento das maquinas de aplicação, acesse:

*    Node1: http://172.17.177.21:8080

*    Node2: http://172.17.177.22:8080


Acesso direto a aplicação:

*    Node1: http://172.17.177.21:3000

*    Node2: http://172.17.177.22:3000


Teste de carga
O teste de carga foi utilizado com a ferramenta JMeter, para o download acesse: http://jmeter.apache.org/download_jmeter.cgi

Após instalar o Jmeter carregue o arquivo na pasta /apache-jmeter 

------------------------------------------------------------------

Servidores ip interno: 

*    lb (nginx): 172.17.177.20
    *    proxy:
        *    172.17.177.21:3000
        *    172.17.177.22:3000
*    Node1: 172.17.177.21
    *    App:      172.17.177.21:3000
    *    cAdvisor: 172.17.177.21:8080
*    Node2: 172.17.177.22
    *    App:      172.17.177.22:3000
    *    cAdvisor: 172.17.177.22:8080
*    Controller: 172.17.177.11


------------------------------------------------------------------


Descrição:


Ambiente de testes semelhante a arquitetura de servidores utilizados em aplicações de larga escala, pois a reprodução do comportamento da aplicação implementada em múltiplos nodes é dificil de reproduzir localmente e testar o comportamento de uma funcionalidade sem a arquitetura de servidores. O motivo desta implementação se deve a uma dificuldade que tive em testar novas arquiteturas de servidores e recursos da aplicação sem utilizar os servidores online como a aws, reduzindo o custo de operação e implementação, agilidade no desenvolmento. 

Para simular o comportamento de servidores independentes utilizei as ferramentas de virtualização vagrant em conjunto com o virtualbox, desta maneira poderia abstrair o comportamento individual da maquina e quando necessário o provisionamento e exclusão de maquinas conforme necessário. 

O modelo de arquitura dos servidores ficou com dois servidores para a aplicação, um servidor para a ferramenta de configuração dos servidores(controller) e outra para o servidor de balanceamento de carga. 
A aplicação foi escrita em javascript utilizando nodejs em conjunto com o express e pm2, para a configuração do servidor foi utilizado o Ansible, e para o Proxy Reverso e Balanceamento de carga foi utilizado o nginx redirecionando para os dois servidores da aplicação. 

A implementação da aplicação foi abstraida e utilizado um sistema de conteiner docker, na qual ja instala as dependências no Dockerfile: 

*    Ubuntu 16.04, 
*    NodeJs 6x lts, 
    *    npm, 
    *    express, 
    *    pm2 (permite a utilização de varios núcleos do servidor através de processos, e caso um processo é finalizado o pm2 reinicia automaticamente) 

A utilização do docker foi escolhida para agilizar o processo de implementação e facilidade de realizar o deploy em servidores de produção. As builds geradas para este desafio foram armazenadas em: https://hub.docker.com/r/thiagohara/chaordic-desafio2/ Possuindo as tags de [latest] = produção e [develop] = desenvolvimento. 
    
Como servidor de Proxy reverso e LoadBalance foi escolhido o Nginx na qual foi configurado para redicionar a porta 80 para a porta 3000 dos servidores de aplicação. 

Para o servidor de automação ou controller, foi escolhido a ferramenta Ansible, pois não depende de agents e seu uso é mais simplificado. Entretanto o uso do Ansible requer alguns recursos que não são entregues com a versão de linux escolhida, sendo necessário instalar os pacotes na inicialização do vagrant. 
No ansible foram criados playbooks para o bootstrap dos servidores, que é acionado ao fazer o provisionamento das maquinas pelo $vagrant up, também foi criado playbooks para o deploy de novas tags do docker e também o rollback do docker. 
A combinação do Docker com o Ansible reduziu muito o tempo de atualização da aplicação e também na facilidade fazer o rollback de acordo com a tag da imagem do docker. Durante o processo de bootstrap, deploy e rollback foram encontrados alguns pontos que precisam ser vistos e aprimorados, como por exemplo erros do docker quando troca-se a tag da aplicação e tenta voltar para o que estava antes. O processo de bootstrap é influênciado pelas variantes de velocidade da internet, dependente de ferramentas de terceiros como o docker hub e a capacidade de processamento do servidor, pois quando realizei testes de deploy com um servidor com configurações de hardware mais fracas o ansible travou e não tinha mais respostas do ansible, isso aconteceu mais durante o processo de copia de arquivos do docker hub. 
Em testes de deploy notei uma demora maior ao instalar os pacotes do linux necessários para rodar o Ansible que acabei movendo a instalação de alguns pacotes de instalação apt no bootstrap do vagrant. E o Ansible ficando responsável pelo provisionamento da aplicação. 

Para o monitoramento dos servidores procurei utilizar os métodos mais recomendados, no docker pro exemplo tentei utilizar a combinação do cAdvisor para o monitoramento dos processos do servidor de aplicação e dos conteiners do docker, como o cAdvisor somente monstra em tempo real as taxas do servidor é utilizado em conjunto a ferramenta de banco de dados influxdb para salvar estes dados e também utiliza-se ferramentas de dashboard graficos como grafana para agrupar estes dados. Esta combinação é utilizada para analisar o comportamento em tempo real dos servidores de aplicação e conteiner. Entretanto tive problemas em conseguir fazer o cAdvisor gravar as informações no influxdb e por consequencia o grafana ficaria inutilizado pois precisa das informações do influxdb para funcionar. Pelo pouco tempo disponível resolvi parar processo de implementação destas ferramentas e deixar somente o cAdvisor rodando, que também encontrei pequenos problemas que precisam ser corrigidos, como por exemplo o monitoramento do conteiner da aplicação, em que não exibe o rasteamento dos dados logo após fazer todo o bootstrap inicial, somente depois de parando o conteiner e reinicando o processo do docker o cAdvisor começa a monitorar. 

Para a automação do monitoramento em caso falha gostaria de ter implementado o Monit ou outra ferramenta semelhante, mas devido ao tempo utilizei um método mais simples, um crontab rodando um playbook que fica verificando se o docker esta rodando ou não, se não estiver o Ansible reinicia o processo. Neste ponto precisa de um ajuste pois a chave id_rsa so esta no usuario ubuntu e o crontab esta executando como root, mesmo criando o cron com o usuario ubuntu. 

Para realizar testes de carga preferi utilizar uma ferramenta que me permita simular o acesso simultâneo ao servidor, gerando novos processos para isso, para tal escolhi utilizar a ferramenta Apache JMeter. 
Em testes realizados no servidor de aplicação o servidor com 1 core de processamento 2.00ghz e 1024mb de memória foi capaz de receber aproximadamente 8mb de dados e o conteiner aproximadamente 6 a 7mb de dados, processamento foi utilizado 100% do tempo e a memória ficou com um pico de 70 a 80% da capacidade máxima. Algo interessante que pude observar foi que o teste não derrubou o conteiner e nem o servidor, como geralmente acontece com as aplicações em php. Por mais que exigisse mais da aplicação não consegui derrubar ela... :). No momento não consegui achar muitas respostas mas acredito que a arquitetura do node forneça tenha esta característica. Também percebi uma diferença entre o processamento da maquina do servidor e o conteiner possivelmente existe um gargalo de recursos que não consegui descobri qual seria. 
Em testes feitos diretamente no balanceamento de carga o loadbalance utilizou mais os recursos de um servidor e metade do processamento do segundo servidor, e o mesmo também aguentou altas cargas de processamento entre 200 a 300 usuários simultâneos a cada segundo, elevando o numero de acessos simultâneos para 5000 o nginx não suportou a quantidade de trafego e começou a apresentar erros de bad request, a partir deste ponto irei fazendo testes para descobrir a quantidade maxima de acessos suportado pelo loadbalance. 
Durante o teste tentei fazer um deploy do docker e o mesmo apresentou erro de conexão de internet, então o deploy de código em servidores utilizando a largura de banda máxima é um limitante para o deploy. Significa que precisaria rever a tecnica de deploy da aplicação. 

Conforme descrito acima, o planejamento de utilização dos influxdb no registro do log dos seriam muitos uteis na construção de relatórios e analise de dados, e o mesmo método de armazenamento de dados seria ideal também para o monitoramento de acessos ou erros do nginx. Como está tecnica pode demandar um pouco mais de tempo para a implementação, optei pelo processamento do access.log do nginx com um script shell para fazer o parser e abstração das informações de dados, com o resultado do parser armazenado em uma pasta, o texto do parser é salvo por dia e utilizado um módulo do ansible para enviar email. 