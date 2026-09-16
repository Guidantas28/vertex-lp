// Mural de depoimentos (a parede que rola depois do FAQ).
//
// Os 15 depoimentos "de capa" moram no SOCIAL (content.ts) porque também
// aparecem soltos em outras seções. Aqui ficam os outros 100, que existem só
// pra ENCHER a parede: o mural precisa de massa pra parecer uma parede de
// avaliações de verdade e não três colunas repetindo as mesmas cinco pessoas.
//
// ATENÇÃO: é conteúdo de PLACEHOLDER, no mesmo espírito dos 15 do SOCIAL.
// Nome, negócio e nota são inventados. Antes de ir pro ar com nota em
// estrela na cara do visitante, trocar por depoimento de cliente real (ou
// marcar o bloco como exemplo), que é o que a lei de publicidade espera.
//
// A foto NÃO mora aqui: são 15 retratos no /assets/people e o mural distribui
// eles com passo largo (veja TestimonialsMarquee4.astro), pra mesma cara nunca
// cair perto dela mesma na coluna.

export type Depoimento = {
  nome: string;
  negocio: string;
  cidade: string;
  /** 4.3 a 4.8, uma casa. Vira estrela amarela no card. */
  nota: number;
  /** De qual pilha de retratos o mural tira a foto, pra a cara casar com o
      nome. São 15 fotos no /assets/people: 8 masculinas, 7 femininas. */
  retrato: "f" | "m";
  texto: string;
};

export const DEPOIMENTOS: Depoimento[] = [
  // ── comércio e varejo ──────────────────────────────────────────────────
  { nome: "Camila Duarte", negocio: "Encanto Moda", cidade: "Juiz de Fora, MG", nota: 4.7, retrato: "f", texto: "O cliente escolhe pelo catálogo e o pedido já cai com endereço e forma de pagamento. Acabou a conversa de vinte mensagens pra fechar uma peça." },
  { nome: "Rafael Teixeira", negocio: "Ótica Visão Clara", cidade: "Londrina, PR", nota: 4.5, retrato: "m", texto: "Cada armação tem ficha, garantia e data de entrega. Quando o cliente liga perguntando, respondo em dez segundos." },
  { nome: "Beatriz Campos", negocio: "Papelaria Ponto Certo", cidade: "Sorocaba, SP", nota: 4.6, retrato: "f", texto: "Volta às aulas sem caos: o estoque avisa o que está acabando e eu compro antes da fila chegar." },
  { nome: "Gustavo Prado", negocio: "Bazar da Praça", cidade: "Natal, RN", nota: 4.3, retrato: "m", texto: "Comecei anotando tudo em caderno. Hoje o caixa fecha sozinho e eu sei o lucro de cada prateleira." },
  { nome: "Marina Freitas", negocio: "Casa Bonita Presentes", cidade: "Vitória, ES", nota: 4.8, retrato: "f", texto: "Dezembro deixou de ser pesadelo. Pedido, embrulho e entrega saem numa fila só e a equipe temporária aprendeu em uma tarde." },
  { nome: "Thiago Barbosa", negocio: "Sport Center Calçados", cidade: "Uberlândia, MG", nota: 4.6, retrato: "m", texto: "Grade de numeração controlada de verdade. Nunca mais vendi um par que não tinha no estoque." },
  { nome: "Priscila Nogueira", negocio: "Doce Lar Enxovais", cidade: "Ribeirão Preto, SP", nota: 4.4, retrato: "f", texto: "Mando o catálogo no WhatsApp e o pedido volta pronto. Vendo pra cidade inteira sem sair da loja." },
  { nome: "Alexandre Lima", negocio: "Eletro Fácil", cidade: "Campo Grande, MS", nota: 4.7, retrato: "m", texto: "Venda parcelada, garantia e assistência no mesmo cadastro. O pós-venda parou de depender da memória de alguém." },
  { nome: "Fabiana Rocha", negocio: "Perfumaria Aurora", cidade: "Maceió, AL", nota: 4.5, retrato: "f", texto: "Sei quais produtos giram e quais só ocupam espaço. Comprei melhor e o caixa sentiu no mês seguinte." },
  { nome: "Leandro Martins", negocio: "Mundo Kids Baby", cidade: "Joinville, SC", nota: 4.6, retrato: "m", texto: "Duas lojas com um estoque só. Se falta numa, o sistema mostra onde tem e eu não perco a venda." },
  { nome: "Renata Barros", negocio: "Tecidos Bom Corte", cidade: "Blumenau, SC", nota: 4.3, retrato: "f", texto: "Corte por metro sempre bagunçava o controle. Agora cada retalho vendido baixa certinho." },
  { nome: "Otávio Guimarães", negocio: "Ferragens São Jorge", cidade: "Anápolis, GO", nota: 4.7, retrato: "m", texto: "Balcão, WhatsApp e loja online puxando do mesmo estoque. O que vende num canal some do outro na hora." },
  { nome: "Isabela Correia", negocio: "Flor de Lis Floricultura", cidade: "Niterói, RJ", nota: 4.4, retrato: "f", texto: "Pedido de última hora com entrega marcada. A agenda do entregador é a mesma do pedido, então nada se perde." },
  { nome: "Vinícius Amaral", negocio: "Tech Store Acessórios", cidade: "Cuiabá, MT", nota: 4.8, retrato: "m", texto: "Faturamento subiu porque parei de perder cliente na demora. A IA responde preço e disponibilidade enquanto eu atendo o balcão." },

  // ── alimentação ────────────────────────────────────────────────────────
  { nome: "Mariana Siqueira", negocio: "Padaria Pão de Casa", cidade: "Santo André, SP", nota: 4.6, retrato: "f", texto: "Encomenda de bolo com data, sabor e sinal pago. A cozinha vê tudo na tela e ninguém mais esquece pedido de aniversário." },
  { nome: "Caio Monteiro", negocio: "Pizzaria Bella Massa", cidade: "Bauru, SP", nota: 4.7, retrato: "m", texto: "Sexta à noite o pedido entra pelo WhatsApp e já sai pra cozinha. Minha esposa parou de anotar em papel entre uma ligação e outra." },
  { nome: "Larissa Fontes", negocio: "Açaí do Ponto", cidade: "Belém, PA", nota: 4.4, retrato: "f", texto: "Controlo polpa, copo e complemento. No fim do mês sei quanto cada combinação deixou de verdade." },
  { nome: "Everton Dias", negocio: "Burger House", cidade: "Caxias do Sul, RS", nota: 4.5, retrato: "m", texto: "Pedido, pagamento e status do preparo numa tela só. O cliente acompanha e para de perguntar se já saiu." },
  { nome: "Simone Teles", negocio: "Marmitaria Sabor Caseiro", cidade: "Contagem, MG", nota: 4.6, retrato: "f", texto: "Cem marmitas por dia com rota de entrega organizada. Antes eu montava a lista no papel às seis da manhã." },
  { nome: "Douglas Peixoto", negocio: "Empório do Grão", cidade: "Santos, SP", nota: 4.3, retrato: "m", texto: "Venda a granel com peso e preço certos no cupom. O conferente e o caixa finalmente batem." },
  { nome: "Aline Furtado", negocio: "Café & Prosa", cidade: "São José dos Campos, SP", nota: 4.7, retrato: "f", texto: "Fidelidade, comanda e caixa juntos. O cliente frequente é reconhecido sem eu precisar lembrar do nome dele." },
  { nome: "Rodrigo Nunes", negocio: "Bebidas Já Distribuidora", cidade: "Feira de Santana, BA", nota: 4.8, retrato: "m", texto: "Rota, pedido e cobrança no mesmo lugar. O vendedor fecha na rua e o financeiro vê antes dele voltar." },
  { nome: "Patrícia Vilela", negocio: "Doceria Encanto", cidade: "Aracaju, SE", nota: 4.5, retrato: "f", texto: "Orçamento de festa vira pedido com um clique. Parei de refazer a mesma conta três vezes." },
  { nome: "Márcio Fagundes", negocio: "Restaurante Fogo Alto", cidade: "Palmas, TO", nota: 4.4, retrato: "m", texto: "Fechamento do dia em cinco minutos. Antes eu ficava até meia-noite conferindo comanda com o caixa." },
  { nome: "Tatiane Rangel", negocio: "Hortifruti Vida Verde", cidade: "Vila Velha, ES", nota: 4.6, retrato: "f", texto: "Perda de produto caiu porque acompanho o giro por dia. Compro o que vende e o resto não apodrece no depósito." },
  { nome: "Bruno Salgado", negocio: "Food Truck Rua Boa", cidade: "Florianópolis, SC", nota: 4.3, retrato: "m", texto: "Vendo em qualquer praça com o celular. PIX cai, cupom sai e o estoque baixa no mesmo toque." },

  // ── beleza, saúde e pet ────────────────────────────────────────────────
  { nome: "Camila Bastos", negocio: "Salão Beleza Real", cidade: "Osasco, SP", nota: 4.8, retrato: "f", texto: "A agenda das seis profissionais numa tela. A cliente remarca sozinha pelo link e ninguém liga mais pra confirmar." },
  { nome: "Henrique Vasques", negocio: "Barbearia Navalha de Ouro", cidade: "Guarulhos, SP", nota: 4.7, retrato: "m", texto: "Comissão calculada sozinha por barbeiro. Sexta-feira parou de virar discussão sobre quem atendeu quem." },
  { nome: "Daniela Prado", negocio: "Clínica Sorriso Claro", cidade: "Curitiba, PR", nota: 4.6, retrato: "f", texto: "Orçamento aprovado vira plano de tratamento com as sessões já marcadas. O paciente sabe exatamente o que vem pela frente." },
  { nome: "Fernanda Lacerda", negocio: "Estética Corpo e Alma", cidade: "Goiânia, GO", nota: 4.5, retrato: "f", texto: "Pacote de dez sessões com saldo visível. A cliente vê quantas faltam e a recepção não precisa procurar ficha." },
  { nome: "Rogério Antunes", negocio: "Fisio Movimento", cidade: "Porto Velho, RO", nota: 4.4, retrato: "m", texto: "Evolução do paciente, convênio e recibo no mesmo lugar. O repasse do plano parou de atrasar por documento perdido." },
  { nome: "Luciana Peixoto", negocio: "Nutri Equilíbrio", cidade: "Recife, PE", nota: 4.6, retrato: "f", texto: "Consulta, retorno e plano alimentar organizados. Consigo atender mais gente sem virar refém do caderninho." },
  { nome: "Paulo Sérgio Braga", negocio: "Vet Amigo Fiel", cidade: "Belo Horizonte, MG", nota: 4.7, retrato: "m", texto: "Vacina com data de reforço avisando sozinha. O tutor recebe a mensagem e volta, sem eu caçar cadastro." },
  { nome: "Juliana Moura", negocio: "Pet Shop Patas Felizes", cidade: "Fortaleza, CE", nota: 4.5, retrato: "f", texto: "Banho, tosa e loja no mesmo caixa. Sei quanto cada serviço rende e parei de vender no prejuízo." },
  { nome: "Mateus Carvalho", negocio: "Studio Tattoo Ferro", cidade: "Porto Alegre, RS", nota: 4.3, retrato: "m", texto: "Sinal, sessão e retoque com histórico. Cliente sumido eu recupero em duas mensagens." },
  { nome: "Adriana Lopes", negocio: "Espaço Zen Massagem", cidade: "Campinas, SP", nota: 4.6, retrato: "f", texto: "A confirmação automática cortou quase todas as faltas. Horário vago agora é raro." },
  { nome: "Ricardo Peres", negocio: "Clínica Bem Estar", cidade: "Manaus, AM", nota: 4.8, retrato: "m", texto: "Cinco especialidades numa agenda só, sem choque de sala. A recepção finalmente parou de correr." },
  { nome: "Carolina Braga", negocio: "Lash Studio Cílios", cidade: "Santarém, PA", nota: 4.4, retrato: "f", texto: "Trabalho sozinha e o sistema virou minha secretária. Ele confirma, lembra e ainda registra o que a cliente gosta." },
  { nome: "Wagner Oliveira", negocio: "Sons Ótica e Audiometria", cidade: "Teresina, PI", nota: 4.5, retrato: "m", texto: "Exame, aparelho e manutenção no mesmo prontuário. O acompanhamento de um ano virou automático." },
  { nome: "Tatiana Melo", negocio: "Clínica Derma Viva", cidade: "Brasília, DF", nota: 4.7, retrato: "f", texto: "Protocolo com foto de antes e depois no cadastro. A cliente vê a evolução e fecha o próximo pacote na hora." },

  // ── auto e oficina ─────────────────────────────────────────────────────
  { nome: "Fábio Mendonça", negocio: "Mecânica Rodas Livres", cidade: "Londrina, PR", nota: 4.6, retrato: "m", texto: "Orçamento com foto da peça sai pelo WhatsApp e volta aprovado. O carro entra no elevador sem ligação de meia hora." },
  { nome: "Cristiano Sales", negocio: "Auto Elétrica Faísca", cidade: "São Luís, MA", nota: 4.4, retrato: "m", texto: "Cada serviço com garantia registrada. Quando o cliente volta, sei o que foi feito e quando." },
  { nome: "Jéssica Ramos", negocio: "Estética Automotiva Brilho", cidade: "Santos, SP", nota: 4.5, retrato: "f", texto: "Agenda cheia sem encavalar. Cada box tem horário e o cliente recebe a hora certa de buscar." },
  { nome: "Anderson Pinto", negocio: "Funilaria Linha Fina", cidade: "Contagem, MG", nota: 4.7, retrato: "m", texto: "Sinistro com seguradora tem prazo. Aqui todo mundo vê em que etapa o carro está, sem precisar perguntar." },
  { nome: "Márcia Fontoura", negocio: "Moto Peças Veloz", cidade: "Cascavel, PR", nota: 4.3, retrato: "f", texto: "Peça com código, aplicação e estoque real. Parei de prometer o que não tinha na prateleira." },
  { nome: "Elton Ribeiro", negocio: "Centro Automotivo Dois Irmãos", cidade: "Uberaba, MG", nota: 4.8, retrato: "m", texto: "Ordem de serviço, peça e mão de obra na mesma conta. Fecho o mês sabendo o lucro por carro." },
  { nome: "Sérgio Duarte", negocio: "Lava Rápido Água Nova", cidade: "Salvador, BA", nota: 4.4, retrato: "m", texto: "Mensalista com plano controlado. Sei quem pagou e quem está devendo sem abrir planilha." },
  { nome: "Renan Coelho", negocio: "Borracharia 24 Horas", cidade: "Jundiaí, SP", nota: 4.3, retrato: "m", texto: "Chamado de madrugada com endereço e valor já combinados. O socorro sai direto pelo celular." },
  { nome: "Viviane Castro", negocio: "Oficina Diesel Pesado", cidade: "Rondonópolis, MT", nota: 4.6, retrato: "f", texto: "Frota com histórico por placa. O gestor recebe o relatório e aprova sem pisar aqui." },
  { nome: "Alex Barreto", negocio: "Auto Center Norte", cidade: "Belém, PA", nota: 4.5, retrato: "m", texto: "Revisão programada avisando o cliente na data. Voltou a ser normal o carro retornar aqui." },

  // ── serviços de campo ──────────────────────────────────────────────────
  { nome: "Gilberto Nascimento", negocio: "Clima Frio Refrigeração", cidade: "Campo Grande, MS", nota: 4.7, retrato: "m", texto: "Cada técnico sai com a lista do dia no celular. Checklist e foto do serviço chegam antes dele voltar." },
  { nome: "Sabrina Correia", negocio: "Dedetizadora Mais Vida", cidade: "Goiânia, GO", nota: 4.4, retrato: "f", texto: "O certificado sai junto com o serviço. Nada de cliente cobrando papel na semana seguinte." },
  { nome: "Marcelo Tavares", negocio: "Solar Energia Livre", cidade: "Fortaleza, CE", nota: 4.8, retrato: "m", texto: "Da visita técnica à instalação, tudo numa linha do tempo. O cliente investe alto e quer ver cada passo." },
  { nome: "Débora Antunes", negocio: "Piscinas Água Azul", cidade: "Rio de Janeiro, RJ", nota: 4.5, retrato: "f", texto: "Manutenção mensal com rota organizada. A equipe atende mais casas no mesmo dia." },
  { nome: "Jorge Pacheco", negocio: "Elétrica Segura", cidade: "Recife, PE", nota: 4.6, retrato: "m", texto: "Orçamento na hora, no local, pelo celular. Fechei serviço antes de o concorrente responder." },
  { nome: "Carla Bezerra", negocio: "Verde Jardins e Paisagismo", cidade: "Florianópolis, SC", nota: 4.3, retrato: "f", texto: "Contrato de manutenção com visitas programadas. O faturamento ficou previsível pela primeira vez." },
  { nome: "Emerson Ferraz", negocio: "Vidraçaria Cristal", cidade: "Betim, MG", nota: 4.5, retrato: "m", texto: "Medida, corte e instalação com data acertada. Erro de medida virou exceção porque tudo fica registrado." },
  { nome: "Nathália Prado", negocio: "Marcenaria Sob Medida", cidade: "Curitiba, PR", nota: 4.7, retrato: "f", texto: "Projeto, aprovação e entrega num fluxo só. O cliente assina digital e a produção começa no mesmo dia." },
  { nome: "Ivan Queiroz", negocio: "Chaveiro Express", cidade: "São Paulo, SP", nota: 4.3, retrato: "m", texto: "Atendimento rápido com histórico de endereço. Cliente antigo eu atendo sem pedir dado de novo." },
  { nome: "Regina Alcântara", negocio: "Limpeza Predial Nova Face", cidade: "Santo André, SP", nota: 4.6, retrato: "f", texto: "Equipe, posto e ponto controlados. A prestação de contas pro condomínio sai pronta todo mês." },
  { nome: "Hugo Martins", negocio: "Hidráulica Pronta", cidade: "Sorocaba, SP", nota: 4.4, retrato: "m", texto: "Chamado urgente entra na fila com prioridade. Ninguém fica esperando resposta que nunca chega." },
  { nome: "Simara Vieira", negocio: "Ar Puro Climatização", cidade: "Maceió, AL", nota: 4.6, retrato: "f", texto: "Contrato com relatório automático. O que era pasta de papel virou histórico que se consulta em segundos." },

  // ── construção, engenharia e arquitetura ───────────────────────────────
  { nome: "Leonardo Ferrari", negocio: "Construtora Alicerce", cidade: "Curitiba, PR", nota: 4.7, retrato: "m", texto: "Medição de obra, diário e pagamento de empreiteiro no mesmo sistema. Acabou a planilha que só uma pessoa entendia." },
  { nome: "Patrícia Moreira", negocio: "Arquitetura Espaço Vivo", cidade: "São Paulo, SP", nota: 4.6, retrato: "f", texto: "Proposta bonita, contrato assinado e cronograma na sequência. O cliente percebe a organização antes da primeira parede." },
  { nome: "Josué Bittencourt", negocio: "Reformas Bem Feito", cidade: "Salvador, BA", nota: 4.4, retrato: "m", texto: "Orçamento com material e mão de obra separados. Sei onde o lucro escapa em cada obra." },
  { nome: "Elaine Caldas", negocio: "Engenharia Prumo", cidade: "Fortaleza, CE", nota: 4.5, retrato: "f", texto: "Laudo, documento e visita organizados por cliente. Achar papel de dois anos atrás leva segundos." },
  { nome: "Márcio Seabra", negocio: "Gesso e Drywall Linha Reta", cidade: "Guarulhos, SP", nota: 4.3, retrato: "m", texto: "Equipe em três obras ao mesmo tempo e eu sei o que cada uma consumiu." },
  { nome: "Tatiane Rossi", negocio: "Pisos e Revestimentos Duo", cidade: "Joinville, SC", nota: 4.6, retrato: "f", texto: "Amostra, pedido e instalação amarrados. O cliente escolhe na loja e a agenda já marca a instalação." },
  { nome: "Wanderson Luz", negocio: "Terraplanagem Rocha", cidade: "Palmas, TO", nota: 4.4, retrato: "m", texto: "Hora de máquina apontada no campo cai direto no faturamento. Fim de mês sem discussão." },
  { nome: "Carolina Braz", negocio: "Interiores Casa Nova", cidade: "Belo Horizonte, MG", nota: 4.7, retrato: "f", texto: "Cada projeto com fornecedor, prazo e pagamento. Entrego no dia combinado porque enxergo o caminho todo." },

  // ── escritórios e profissionais ────────────────────────────────────────
  { nome: "Rafael Quintana", negocio: "Contabilidade Precisa", cidade: "Porto Alegre, RS", nota: 4.6, retrato: "m", texto: "O cliente manda documento pelo WhatsApp e cai organizado na pasta certa. A equipe parou de garimpar anexo." },
  { nome: "Vanessa Cordeiro", negocio: "Cordeiro & Souza Advocacia", cidade: "Recife, PE", nota: 4.5, retrato: "f", texto: "Prazo, audiência e honorário no mesmo painel. O escritório inteiro enxerga o andamento sem me perguntar." },
  { nome: "Diego Fortunato", negocio: "Proteger Seguros", cidade: "Campinas, SP", nota: 4.7, retrato: "m", texto: "Renovação avisando com trinta dias. A carteira parou de vazar por esquecimento." },
  { nome: "Silvia Nogueira", negocio: "Imobiliária Morar Bem", cidade: "Balneário Camboriú, SC", nota: 4.8, retrato: "f", texto: "Visita, proposta e contrato numa esteira só. O corretor sabe exatamente qual é o próximo passo de cada cliente." },
  { nome: "Marcos Tenório", negocio: "Despachante Ágil", cidade: "Aracaju, SE", nota: 4.3, retrato: "m", texto: "Processo com status que o cliente acompanha. O telefone parou de tocar pra perguntar como está." },
  { nome: "Andreia Villas", negocio: "RH Gente Boa Consultoria", cidade: "São Paulo, SP", nota: 4.5, retrato: "f", texto: "Proposta, contrato e horas apontadas. Faturo o que trabalhei, sem deixar hora na mesa." },
  { nome: "Felipe Andrade", negocio: "Conecta Suporte de TI", cidade: "Belo Horizonte, MG", nota: 4.6, retrato: "m", texto: "Chamado com prazo visível. O cliente vê quando fica pronto e a equipe vê a fila, sem ninguém furando no grito." },
  { nome: "Bianca Rodrigues", negocio: "Agência Ponto Criativo", cidade: "Florianópolis, SC", nota: 4.4, retrato: "f", texto: "Job, aprovação e cobrança no mesmo lugar. Parei de perder faturamento em trabalho já entregue." },
  { nome: "Roberto Klein", negocio: "Klein Auditoria", cidade: "Curitiba, PR", nota: 4.5, retrato: "m", texto: "Checklist por cliente com evidência anexada. A revisão do ano passado está a dois cliques." },
  { nome: "Marcela Pinheiro", negocio: "Traduções Palavra Certa", cidade: "Rio de Janeiro, RJ", nota: 4.3, retrato: "f", texto: "Orçamento por lauda calculado na hora. Respondo o cliente antes de ele pedir pra outro." },

  // ── educação e fitness ─────────────────────────────────────────────────
  { nome: "Eduardo Sampaio", negocio: "Escola de Idiomas Fluency", cidade: "Santos, SP", nota: 4.6, retrato: "m", texto: "Matrícula, turma e mensalidade conectadas. A inadimplência caiu porque o aviso sai sozinho." },
  { nome: "Priscila Tavares", negocio: "Autoescola Direção Certa", cidade: "Goiânia, GO", nota: 4.5, retrato: "f", texto: "Aula marcada com instrutor e veículo certos. Acabou o aluno chegar e não ter carro livre." },
  { nome: "Rodolfo Menezes", negocio: "Academia Corpo Ativo", cidade: "Natal, RN", nota: 4.7, retrato: "m", texto: "Plano, entrada e cobrança recorrente. Sei quem sumiu e chamo antes de perder o aluno." },
  { nome: "Camila Ventura", negocio: "Studio Pilates Equilíbrio", cidade: "Vitória, ES", nota: 4.6, retrato: "f", texto: "Turmas de cinco pessoas com lista de espera. Horário vago some rapidinho." },
  { nome: "Alan Rodrigues", negocio: "Escola de Natação Golfinho", cidade: "Maringá, PR", nota: 4.4, retrato: "m", texto: "Avaliação por nível e presença registrada. O pai acompanha a evolução sem precisar me achar na borda." },
  { nome: "Luísa Marinho", negocio: "Curso Técnico Avante", cidade: "Fortaleza, CE", nota: 4.5, retrato: "f", texto: "Da inscrição ao certificado, tudo numa trilha. A secretaria deixou de viver em planilha." },
  { nome: "Rafael Domingues", negocio: "CT Luta Livre", cidade: "Belém, PA", nota: 4.3, retrato: "m", texto: "Mensalidade no automático e graduação registrada. Sobra tempo pra treinar em vez de cobrar." },

  // ── atacado, indústria e agro ──────────────────────────────────────────
  { nome: "Gerson Pontes", negocio: "Distribuidora Norte Forte", cidade: "Manaus, AM", nota: 4.7, retrato: "m", texto: "O pedido do representante entra direto no sistema. A separação começa antes dele sair do cliente." },
  { nome: "Cíntia Almeida", negocio: "Gráfica Imprime Bem", cidade: "Osasco, SP", nota: 4.5, retrato: "f", texto: "Arte aprovada, produção e entrega com prazo visível. Retrabalho por versão errada quase sumiu." },
  { nome: "Hélio Barreto", negocio: "Confecções Linha Sul", cidade: "Caxias do Sul, RS", nota: 4.4, retrato: "m", texto: "Grade por tamanho e cor sem dor de cabeça. O representante vende olhando o estoque de verdade." },
  { nome: "Marta Siqueira", negocio: "Embalagens Prática", cidade: "Ribeirão Preto, SP", nota: 4.6, retrato: "f", texto: "Preço por volume calculado certo em toda proposta. Parei de vender barato por conta errada." },
  { nome: "Nelson Aguiar", negocio: "Agro Insumos Boa Terra", cidade: "Rondonópolis, MT", nota: 4.5, retrato: "m", texto: "Safra com pedido, entrega e prazo de pagamento amarrados. O produtor confia porque tudo fica registrado." },
  { nome: "Rosana Delgado", negocio: "Metalúrgica Precisa", cidade: "Joinville, SC", nota: 4.3, retrato: "f", texto: "Orçamento com material, corte e hora de máquina. A margem deixou de ser chute." },
  { nome: "Ubirajara Melo", negocio: "Frigorífico Boi Bom", cidade: "Campo Grande, MS", nota: 4.4, retrato: "m", texto: "Peso, lote e nota saindo juntos. A conferência da carga parou de atrasar o caminhão." },
  { nome: "Silmara Rocha", negocio: "Cosméticos Naturais Flor", cidade: "Belo Horizonte, MG", nota: 4.6, retrato: "f", texto: "A revendedora faz o pedido sozinha pelo catálogo. Meu WhatsApp voltou a ser meu." },

  // ── eventos, logística e outros ────────────────────────────────────────
  { nome: "Danilo Ferrarini", negocio: "Buffet Encontro Perfeito", cidade: "São Paulo, SP", nota: 4.7, retrato: "m", texto: "Evento com orçamento, cardápio e equipe escalada. No sábado ninguém pergunta o que é pra fazer." },
  { nome: "Kelly Andrade", negocio: "Festas Mundo Mágico", cidade: "Curitiba, PR", nota: 4.4, retrato: "f", texto: "Locação com data reservada e devolução controlada. Nunca mais aluguei o mesmo brinquedo duas vezes." },
  { nome: "Marcos Vinícius Leal", negocio: "Foto e Vídeo Instante", cidade: "Recife, PE", nota: 4.5, retrato: "m", texto: "Contrato, sinal e entrega de álbum com prazo. O cliente acompanha e eu durmo tranquilo." },
  { nome: "Sueli Barreto", negocio: "Lavanderia Roupa Nova", cidade: "Guarulhos, SP", nota: 4.3, retrato: "f", texto: "Cada peça com etiqueta e status. Reclamação de peça sumida virou coisa do passado." },
  { nome: "Everaldo Nunes", negocio: "Transportes Rápido Sul", cidade: "Porto Alegre, RS", nota: 4.6, retrato: "m", texto: "Coleta, entrega e comprovante no celular do motorista. O cliente recebe a confirmação na hora." },
];
