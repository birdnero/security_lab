# security_lab_backend

Стартовий FastAPI сервіс для лабораторної.

## Запуск

```bash
pip install -r requirements.txt
uvicorn src.main:app --reload
```

Сервіс буде доступний на `http://localhost:8000`.

## Запуск з фронтендом на `/`

1. Збери фронтенд:

```bash
cd ../security_lab
npm ci
npm run build
```

2. Запусти бекенд:

```bash
cd ../security_lab_backend
uvicorn src.main:app --reload
```

Якщо файл `../security_lab/dist/index.html` існує, FastAPI віддає фронтенд на `http://localhost:8000/`.
API лишається на тих самих адресах (`/random/*`, `/health`).

## Ендпоінти

- `GET /health` - health-check
- `POST /random/generate` - згенерувати n псевдорандомних чисел
- `POST /random/chizaru` - оцінка генератора псевдовипадкових чисел у порівнянні з числом PI 
- `POST /random/sequence-period` - оцінка періоду послідовності
- `POST /random/compare` - порівняння бітового балансу 0/1 з вбудованим генератором
