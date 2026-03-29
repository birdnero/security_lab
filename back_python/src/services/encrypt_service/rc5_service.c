// gcc -O2 -fPIC -shared -o librc5_service.so rc5_service.c
#include <stdint.h>
#include <string.h>

#define max(x, y) ((x) > (y) ? (x) : (y))
//? x і маска яка створються як ми сунемо на w, отримуємо 100.. а далі -1 робить з цього 111.. але для w=64 це буде оверффлов тому там беремо верхнє значення (якась константа підказана джпт)
#define MOD_(x, w) ((x) & (((w) == 64 ? UINT64_MAX : (((uint64_t)(1) << (w)) - 1))))
// #define ROTL_(x, n, w) (((x) << ((n) % (w))) | ((x) >> ((w) - ((n) % (w)))))
// #define ROTR_(x, n, w) (((x) >> ((n) % (w))) | ((x) << ((w) - ((n) % (w)))))
//? Рівест кринж обрав константи які мають похтбку і різні для різних w
uint64_t P64 = 0xB7E151628AED2A6B, Q64 = 0x9E3779B97F4A7C15;
uint32_t P32 = 0xb7e15163, Q32 = 0x9e3779b9;
uint16_t P16 = 0xb7e1, Q16 = 0x9e37;

uint64_t P(int w) {
    if (w == 16) return P16;
    if (w == 32) return P32;
    return P64;
}

uint64_t Q(int w) {
    if (w == 16) return Q16;
    if (w == 32) return Q32;
    return Q64;
}

typedef struct {
    uint16_t w;  // word size in bits 16/32/64 bit (word of text)
    uint16_t r;  // rounds 0..255
    uint16_t b;  // bytes in key 0..255
    uint8_t* key; // row key array

    uint64_t* S; // ready key array
    uint8_t block_size_bytes; // just because it computed everywhere 
    uint8_t buffer[16];
    uint8_t buffer_size_bytes;
    uint8_t prev_block[16];
} Context;

static inline uint64_t ROTL_(uint64_t x, uint64_t n, uint8_t w) {
    //? ротейт в межах слова
    uint64_t shift = n % w;
    if (shift == 0) return MOD_(x, w);
    //? обмеження йдуть по розміру слова не по 64, бо хоч і змінна має 64 біти, її справжній розмір залежить від w
    return MOD_((x << shift) | (x >> (w - shift)), w);
}

static inline uint64_t ROTR_(uint64_t x, uint64_t n, uint8_t w) {
    uint64_t shift = n % w;
    if (shift == 0) return MOD_(x, w);
    return MOD_((x >> shift) | (x << (w - shift)), w);
}

//? хелпери які грузять інпут в змінну в літл ендіан і в зворотню сторону
static uint64_t load_word_le(const uint8_t* input, uint8_t word_size_bytes) {
    uint64_t v = 0; //? зсув вліво щоб поставити перший байти правіше і ми так помалу рухаємося наліво
    for (uint8_t i = 0; i < word_size_bytes; i++) v |= ((uint64_t)input[i]) << (8 * i);
    return v;
}

static void store_word_le(uint8_t* output, uint64_t word, uint8_t word_size_bytes) {
    //? зсув вправо, бо перший байт найправіший і ми витягуємо 4 3 2 1 0 в такому порядку 
    for (uint8_t i = 0; i < word_size_bytes; i++) output[i] = (uint8_t)(word >> (8 * i));
}

void init_keys(const uint8_t* K, uint8_t r, uint8_t b, uint8_t w, uint64_t* S) {
    // it is ceil))  // K length (k in little endian) dyvided in parts u== bytes in one word | c == amount of parts |t==amount of words
    //? t на 2 більший бо у нас є просто доавання на початку якщо що 
    uint32_t u = w / 8, c = (b + u - 1) / u, t = 2 * r + 2;
    if (c == 0) c = 1;
    uint64_t L[c];
    memset(L, 0, sizeof(L));
    // 8bytes parts pack in 64byte cells in little endian by shifting them left and adding next part
    for (int16_t i = (int16_t)b - 1; i >= 0; i--) L[i / u] = (L[i / u] << 8) + K[i];

    S[0] = P(w);
    //? додавання по модулю щоб не вилізти за межі розміру слова
    for (uint16_t i = 1; i < t; i++) S[i] = MOD_(S[i - 1] + Q(w), w);
    uint16_t i = 0, j = 0;
    uint64_t A = 0, B = 0;
    //? 3 * max(t, c) для того, щоб гарантовано перемішати масиви
    //? індекси окремо по масивах i j зважаючи на їх розміри
    for (uint16_t m = 3 * max(t, c); m > 0; m--, i = (i + 1) % t, j = (j + 1) % c) 
        //? константний і дата залежний зсуви, для швидкого розкиданню байтів і змін по ключі
        A = S[i] = ROTL_(S[i] + A + B, 3, w), B = L[j] = ROTL_(L[j] + A + B, A + B, w);
}

void encrypt(uint64_t wordA, uint64_t wordB, const uint64_t* S, const uint8_t r, const uint8_t w, uint8_t* output) {
    //? початкове додавання, щоб навіть при 0 раундів був мінімаьний шифр))
    wordA = MOD_(wordA + S[0], w), wordB = MOD_(wordB + S[1], w);
    for (uint8_t i = 1; i <= r; i++) {
        //? лінійний іксор слів і доавання ключ, все в модулях, через динамічність розміру слова 
        wordA = MOD_(ROTL_(MOD_(wordA ^ wordB, w), wordB, w) + S[2 * i], w);
        wordB = MOD_(ROTL_(MOD_(wordB ^ wordA, w), wordA, w) + S[2 * i + 1], w);
    }

    uint8_t word_size = w / 8;
    store_word_le(output, wordA, word_size);
    store_word_le(output + word_size, wordB, word_size);
}

void decrypt(uint64_t wordA, uint64_t wordB, const uint64_t* S, const uint8_t r, const uint8_t w, uint8_t* output) {
    for (uint8_t i = r; i > 0; i--) {
        wordB = MOD_(ROTR_(MOD_(wordB - S[2 * i + 1], w), wordA, w) ^ wordA, w);
        wordA = MOD_(ROTR_(MOD_(wordA - S[2 * i], w), wordB, w) ^ wordB, w);
    }
    //? не плутати!
    // wordB -= S[2 * r + 1], wordA -= S[2 * r];
    wordA = MOD_(wordA - S[0], w), wordB = MOD_(wordB - S[1], w);
    uint8_t word_size = w / 8;
    store_word_le(output, wordA, word_size);
    store_word_le(output + word_size, wordB, word_size);
}

void init_context(Context* ctx, const uint8_t* key, const uint8_t* iv, uint16_t b, uint16_t r, uint16_t w, uint64_t* S) {
    ctx->w = w, ctx->r = r, ctx->b = b, ctx->key = (uint8_t*)key, ctx->S = S;
    ctx->block_size_bytes = (uint8_t)(2 * (ctx->w / 8));
    memcpy(ctx->prev_block, iv, ctx->block_size_bytes);
    ctx->buffer_size_bytes = 0;
    init_keys(key, r, b, w, S);
}

void rc5_ecb(const uint8_t* input, Context* ctx, uint8_t* output) {
    //? просто формуємо слова і відправляємо
    uint8_t word_size_bytes = ctx->w / 8;
    uint64_t A = load_word_le(input, word_size_bytes),
             B = load_word_le(input + word_size_bytes, word_size_bytes);
    encrypt(A, B, ctx->S, ctx->r, ctx->w, output);
}

//? частини, що відповідають за перенесення з буфера/входу у шифрування і запис
//? оffset це початкоіий зсув вказіника масиву
void incaps_enc_repeat_part(uint8_t* buffer, int64_t* offset_size_bytes, Context* ctx, uint8_t* output) {
    uint8_t mixed[16];
    //? беру іксорю з попереднім, закидую мікс в ecb, як інпут, отримую на output результат, копіюю новий prev_block збільшую змішення на блок  
    for (uint8_t i = 0; i < ctx->block_size_bytes; i++)
        mixed[i] = buffer[i] ^ ctx->prev_block[i];
    rc5_ecb(mixed, ctx, output + *offset_size_bytes);
    memcpy(ctx->prev_block, output + *offset_size_bytes, ctx->block_size_bytes);
    *offset_size_bytes += ctx->block_size_bytes;
}

void incaps_dec_repeat_part(uint8_t* input, int64_t* offset_size_bytes, Context* ctx, uint8_t* output) {
    //? пакую інпут у слова, декрипчу у tmp яке іксорю із попереднім блоком (пайтон має ecb розшифрувати iv та засунути його в prev на початку), копіюю в prev_block збільшую змішення на блок  
    uint8_t tmp[16];
    uint8_t word_size_bytes = (uint8_t)(ctx->w / 8);
    uint64_t A = load_word_le(input, word_size_bytes);
    uint64_t B = load_word_le(input + word_size_bytes, word_size_bytes);
    decrypt(A, B, ctx->S, ctx->r, ctx->w, tmp);
    for (uint8_t i = 0; i < ctx->block_size_bytes; i++)
        output[*offset_size_bytes + i] = tmp[i] ^ ctx->prev_block[i];
    memcpy(ctx->prev_block, input, ctx->block_size_bytes);
    *offset_size_bytes += ctx->block_size_bytes;
}

//? mode > 0 -> enc | mode == 0 --> dec
int32_t rc5_cbc_pad_encrypt_update(const uint8_t* input, int64_t input_size_bytes, Context* ctx, uint8_t* output) {
    int64_t offset_size_bytes = 0, input_offset_size_bytes = 0;
    //? так як в хеш визначаю скільки треба взяти ще до буфера, енкрипчу якщо достатньо 
    if (ctx->buffer_size_bytes > 0) {
        uint8_t need = (uint8_t)(ctx->block_size_bytes - ctx->buffer_size_bytes);
        uint8_t take = (uint8_t)((input_size_bytes < need) ? input_size_bytes : need);
        if (take > 0) {
            memcpy(ctx->buffer + ctx->buffer_size_bytes, input, take);
            ctx->buffer_size_bytes += take;
            input_offset_size_bytes += take;
        }
        if (ctx->buffer_size_bytes == ctx->block_size_bytes) {
            incaps_enc_repeat_part(ctx->buffer, &offset_size_bytes, ctx, output);
            ctx->buffer_size_bytes = 0;
        }
    }

    while (input_size_bytes - input_offset_size_bytes >= ctx->block_size_bytes) {
        incaps_enc_repeat_part((uint8_t*)(input + input_offset_size_bytes), &offset_size_bytes, ctx, output);
        input_offset_size_bytes += ctx->block_size_bytes;
    }

    //? залишок якщо такий є йде до буфера
    int64_t rem = input_size_bytes - input_offset_size_bytes;
    if (rem > 0) {
        memcpy(ctx->buffer, input + input_offset_size_bytes, rem);
        ctx->buffer_size_bytes = (uint8_t)rem;
    }

    return offset_size_bytes;
}

int32_t rc5_cbc_pad_decrypt_update(const uint8_t* input, int64_t input_size_bytes, Context* ctx, uint8_t* output) {
    int64_t offset_size_bytes = 0;
    int64_t input_offset_size_bytes = 0;

    if (ctx->buffer_size_bytes > 0) {
        uint8_t need = (uint8_t)(ctx->block_size_bytes - ctx->buffer_size_bytes);
        uint8_t take = (uint8_t)((input_size_bytes < need) ? input_size_bytes : need);
        if (take > 0) {
            memcpy(ctx->buffer + ctx->buffer_size_bytes, input, take);
            ctx->buffer_size_bytes += take;
            input_offset_size_bytes += take;
        }
        if (ctx->buffer_size_bytes < ctx->block_size_bytes) return 0;
    }

    //? мусить залишати у буфері останній блок, щоб на фіналі чекнути його і падінг
    while (input_size_bytes - input_offset_size_bytes >= ctx->block_size_bytes) {
        if (ctx->buffer_size_bytes == ctx->block_size_bytes) {
            incaps_dec_repeat_part(ctx->buffer, &offset_size_bytes, ctx, output);
            ctx->buffer_size_bytes = 0;
        }
        memcpy(ctx->buffer, input + input_offset_size_bytes, ctx->block_size_bytes);
        ctx->buffer_size_bytes = ctx->block_size_bytes;
        input_offset_size_bytes += ctx->block_size_bytes;
    }

    int64_t rem = input_size_bytes - input_offset_size_bytes;
    if (rem > 0) {
        //? якщо у буферів щось є, а до цієї іфки дойде і спрацює тільки якщо є блок, тобто по факту якщо щось у буфері є то це блок і його треба дешифрувати
        if (ctx->buffer_size_bytes == ctx->block_size_bytes) {
            incaps_dec_repeat_part(ctx->buffer, &offset_size_bytes, ctx, output);
            ctx->buffer_size_bytes = 0;
        }
        memcpy(ctx->buffer + ctx->buffer_size_bytes, input + input_offset_size_bytes, rem);
        ctx->buffer_size_bytes = (uint8_t)(ctx->buffer_size_bytes + rem);
    }

    return offset_size_bytes;
}

int32_t rc5_cbc_pad_encrypt_final(Context* ctx, uint8_t* output) {
    uint8_t pad = (uint8_t)(ctx->block_size_bytes - ctx->buffer_size_bytes);
    for (uint8_t i = 0; i < pad; i++)
        ctx->buffer[ctx->buffer_size_bytes + i] = pad;
    int64_t fake_offset = 0;
    incaps_enc_repeat_part(ctx->buffer, &fake_offset, ctx, output);

    ctx->buffer_size_bytes = 0;
    return ctx->block_size_bytes;
}

int32_t rc5_cbc_pad_decrypt_final(Context* ctx, uint8_t* output) {
    //? need full last block to validate padding
    if (ctx->buffer_size_bytes != ctx->block_size_bytes) return 0;
    int64_t fake_offset = 0;
    incaps_dec_repeat_part(ctx->buffer, &fake_offset, ctx, output);

    //? перевірка чи вся пад частина валідна
    uint8_t pad = output[ctx->block_size_bytes - 1];
    if (pad == 0 || pad > ctx->block_size_bytes) return 0;
    for (uint8_t i = 0; i < pad; i++) {
        if (output[ctx->block_size_bytes - 1 - i] != pad) return 0;
    }
    ctx->buffer_size_bytes = 0;
    return ctx->block_size_bytes - pad;
}
