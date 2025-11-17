# API Operations - Dockyard Backend

## Visão Geral
Backend NestJS com TypeORM gerenciando hierarquia de funcionários (1000 employees).

---

## 📋 **GET Operations**

### 1. **GET /employees**
Listar todos os funcionários ou buscar por nome.

**Query Parameters:**
- `search` (opcional): Buscar funcionários por nome

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "name": "Ana Silva",
    "title": "Tech Lead",
    "reports_to_id": null,
    "profile_image_url": "img/ana.png",
    "timezone": "America/Sao_Paulo"
  }
]
```

**Regras:**
- ✅ Retorna lista ordenada por nome (ASC)
- ✅ Se `search` fornecido, filtra por nome usando LIKE
- ✅ Sem paginação (retorna todos)

---

### 2. **GET /employees/hierarchy**
Obter hierarquia completa em estrutura de árvore.

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "name": "CEO",
    "subordinates": [
      {
        "id": "uuid",
        "name": "CTO",
        "subordinates": [...]
      }
    ]
  }
]
```

**Regras:**
- ✅ Constrói árvore recursivamente a partir dos roots
- ✅ Cada funcionário tem array `subordinates`
- ✅ Ordenado por nome em cada nível

---

### 3. **GET /employees/roots**
Listar apenas funcionários raiz (sem gerente).

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "name": "CEO",
    "reports_to_id": null
  }
]
```

**Regras:**
- ✅ Retorna apenas `reports_to_id === null`
- ✅ Ordenado por nome (ASC)
- ✅ Equivale a "Tier 1"

---

### 4. **GET /employees/:id**
Buscar funcionário específico por ID.

**Path Parameters:**
- `id` (required): UUID do funcionário

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "name": "Ana Silva",
  "manager": { ... },
  "subordinates": [...]
}
```

**Regras:**
- ✅ Retorna com relações `manager` e `subordinates`
- ❌ `404 Not Found` se ID não existe

---

## ➕ **POST Operations**

### 5. **POST /employees**
Criar novo funcionário.

**Request Body:**
```json
{
  "name": "Maria Santos",
  "title": "Developer",
  "reports_to_id": "uuid-do-gerente", // ou null para Tier 1
  "profile_image_url": "img/maria.png",
  "timezone": "America/Sao_Paulo"
}
```

**Response:** `201 Created`

**Validações:**
- ✅ `name` (required, string, not empty)
- ✅ `title` (required, string, not empty)
- ✅ `reports_to_id` (optional, UUID or null)
- ✅ `profile_image_url` (required, string, not empty)
- ✅ `timezone` (required, string, not empty)

**Regras:**
- ✅ Se `reports_to_id = null` → cria Tier 1 (root)
- ✅ Se `reports_to_id` fornecido → não valida se ID existe (pode falhar silenciosamente)
- ❌ `400 Bad Request` se validação falhar

---

### 6. **POST /employees/bulk**
Criar múltiplos funcionários (seed).

**Request Body:**
```json
[
  {
    "name": "Funcionário 1",
    "title": "Cargo",
    "reports_to_id": null,
    "profile_image_url": "img/1.png",
    "timezone": "UTC"
  },
  ...
]
```

**Response:** `201 Created`

**Regras:**
- ✅ Aceita array de CreateEmployeeDto
- ✅ Cria todos em bulk (performance)
- ⚠️ Se um falhar, todos falham (transação)

---

## ✏️ **PUT Operations**

### 7. **PUT /employees/:id**
Atualizar dados do funcionário.

**Path Parameters:**
- `id` (required): UUID do funcionário

**Request Body:** (todos opcionais)
```json
{
  "name": "Novo Nome",
  "title": "Novo Cargo",
  "reports_to_id": "novo-gerente-uuid",
  "profile_image_url": "img/novo.png",
  "timezone": "Europe/London"
}
```

**Response:** `200 OK`

**Regras:**
- ✅ Atualiza apenas campos fornecidos (partial update)
- ✅ Pode mudar `reports_to_id` (altera hierarquia)
- ⚠️ **NÃO valida ciclos na hierarquia** (use PUT /hierarchy para isso)
- ❌ `404 Not Found` se ID não existe
- ❌ `400 Bad Request` se validação falhar

---

### 8. **PUT /employees/:id/hierarchy**
Atualizar hierarquia com validação de ciclos (drag & drop).

**Path Parameters:**
- `id` (required): UUID do funcionário

**Request Body:**
```json
{
  "new_manager_id": "uuid-do-novo-gerente" // ou null para tornar root
}
```

**Response:** `200 OK`

**Validações Especiais:**
- ✅ Verifica se `new_manager_id` existe
- ✅ **Valida que não cria ciclo na hierarquia**
- ✅ Funcionário não pode reportar a seu próprio subordinado

**Regras:**
- ✅ Se `new_manager_id = null` → torna Tier 1 (root)
- ✅ Percorre hierarquia recursivamente para detectar ciclos
- ❌ `400 Bad Request` se criar ciclo: "Não é possível criar ciclo na hierarquia"
- ❌ `404 Not Found` se IDs não existem

**Exemplo de Ciclo Bloqueado:**
```
CEO → CTO → Developer
Se tentar: CEO.reports_to_id = Developer.id
❌ 400 Bad Request (ciclo detectado)
```

---

## 🗑️ **DELETE Operations**

### 9. **DELETE /employees/:id**
Remover funcionário.

**Path Parameters:**
- `id` (required): UUID do funcionário

**Response:** `204 No Content`

**Validações Críticas:**
- ✅ Verifica se funcionário tem subordinados
- ❌ **Bloqueia se `subordinates.length > 0`**

**Regras:**
- ✅ Só permite deletar funcionários "leaf" (sem subordinados)
- ❌ `400 Bad Request`: "Não é possível deletar funcionário com subordinados. Reatribua-os primeiro."
- ❌ `404 Not Found` se ID não existe

**Workflow para Deletar:**
1. Verificar se tem subordinados
2. Se sim, reatribuir subordinados para outro gerente (PUT)
3. Então deletar

---

## 🔧 **Operações Administrativas**

### 10. **Clear All (não exposta via endpoint)**
Método de serviço para limpar todos os dados.

```typescript
employeesService.clear()
```

**Regras:**
- ⚠️ Deleta TODOS os funcionários
- ⚠️ Usado apenas em testes/reset

---

## 📊 **Regras de Negócio Globais**

### Hierarquia
- ✅ **Tier 1 (Root):** `reports_to_id = null`
- ✅ **Tier 2:** reporta a Tier 1
- ✅ **Tier 3:** reporta a Tier 2
- ✅ Sem limite de profundidade

### Validações
- ✅ **Ciclos:** Validados apenas em `PUT /hierarchy`
- ✅ **Subordinados:** Bloqueiam DELETE
- ⚠️ **Foreign Key:** `reports_to_id` não valida existência em CREATE/UPDATE comum

### Performance
- ✅ `findAll()` sem paginação (OK para 1000 employees)
- ✅ `buildTree()` recursivo (pode ser lento com muitos níveis)
- ✅ `wouldCreateCycle()` percorre hierarquia completa

---

## 🎯 **O que o Frontend PODE Fazer**

### ✅ Permitido
1. **Criar funcionário independente** (POST /employees)
   - Escolher `reports_to_id` livremente
   - Criar Tier 1 com `reports_to_id = null`

2. **Editar funcionário** (PUT /employees/:id)
   - Mudar nome, cargo, timezone, imagem
   - Mudar `reports_to_id` (mas sem validação de ciclo)

3. **Mover na hierarquia** (PUT /employees/:id/hierarchy)
   - Drag & drop com validação de ciclos
   - Tornar root (`new_manager_id = null`)

4. **Deletar funcionário leaf** (DELETE /employees/:id)
   - Apenas se não tem subordinados

5. **Buscar e listar**
   - Todos os funcionários
   - Hierarquia em árvore
   - Apenas roots (Tier 1)
   - Busca por nome

### ❌ Bloqueado
1. **Deletar com subordinados**
   - Backend retorna 400
   - Precisa reatribuir primeiro

2. **Criar ciclos**
   - Validado em PUT /hierarchy
   - Backend retorna 400

3. **IDs inválidos**
   - 404 Not Found

---

## 🚀 **Próximas Implementações Sugeridas**

### No Backend
- [ ] Validar `reports_to_id` existe em CREATE/UPDATE
- [ ] Adicionar paginação em `GET /employees`
- [ ] Endpoint para reatribuir subordinados em massa
- [ ] Soft delete (manter histórico)
- [ ] Auditoria de mudanças na hierarquia

### No Frontend
- [ ] Drag & drop visual na árvore
- [ ] Reatribuir subordinados antes de deletar
- [ ] Visualização de "ciclo detectado" no UI
- [ ] Confirmação ao mover múltiplos níveis
- [ ] Histórico de mudanças na hierarquia

---

## 📝 **Notas Importantes**

1. **Não há autenticação/autorização** (adicionar JWT futuramente)
2. **Não há rate limiting** (vulnerável a spam)
3. **Não há cache** (sempre consulta DB)
4. **Timezone é string livre** (não valida se existe)
5. **Profile image é URL string** (não valida formato/existência)
6. **1000 employees carregados via seed** (employees.json)
