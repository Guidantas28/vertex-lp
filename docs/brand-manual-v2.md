# Vertex · Brand Manual v2

Referência para landing page e VOS proto. Fonte canônica:

- `~/Desktop/Vertex (8)/Vertex Brand Manual v2.html`
- `~/Desktop/Vertex (8)/vertex-manual-v2.css`

## Regras principais

### Cor de ação (Core)
- **Acento:** `#ED4B00` — única cor de botão primário, foco e símbolo
- **Regra:** laranja ≤ 10% da UI; nunca como fundo de seção
- **Core** (Dashboard, Atendimento, CRM, Assinaturas, Tarefas) usa **só laranja** para ação

### Espectro de módulos (wayfinding)
| Módulo     | Hex       | Uso                          |
|------------|-----------|------------------------------|
| Core       | `#ED4B00` | Base / ação                  |
| IA         | `#6D4AFF` | Inteligência                 |
| Comércio   | `#1F6FEB` | Produtos                     |
| Serviços   | `#15935A` | Operação                     |
| Financeiro | `#C9810C` | Dinheiro                     |

Cor de módulo → chips, dots na nav, ícones pequenos. **Não** em botões primários.

### Status (semântico, separado)
- Sucesso `#15935A` · Atenção `#C9810C` · Erro `#DC3B2B`

### Neutros (light)
- Canvas `#F7F6F4` · Surface `#FFFFFF` · Panel sutil `#F1F0ED`
- Ink `#14131C` · Secundário `#5B5A68` · Terciário `#8C8B98`
- Sidebar slate `#0D0C1A` (constante nos dois temas)

### Tipografia
- **Display:** Archivo Expanded 700–800, tracking −3%
- **Corpo / UI:** Archivo 400–600
- **Rótulos / dados:** JetBrains Mono, caixa alta, tracking +10%

### Interface (Vertex OS)
- Sidebar slate · canvas claro · cards brancos · sombras suaves
- Eyebrow mono com traço (não dot) · cor `--mc` ou accent
- Tabs ativas: cor do contexto (accent no Core, `--m-*` nos módulos)

### Extensões fora do manual
- **Prospecção** `#0E97A8` — extensão comercial, não está no espectro v2

## Onde está aplicado no repo

| Área              | Arquivo                          |
|-------------------|----------------------------------|
| Landing           | `src/styles/global.css`          |
| VOS proto tokens  | `public/_proto/vos2/vos2.css`    |
| VOS ext (Prospect)| `public/_proto/vos2/vos2-ext.css`|
