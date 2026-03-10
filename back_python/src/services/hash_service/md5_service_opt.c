//? fastest build (local CPU): gcc -shared -fPIC -O3 -march=native -mtune=native -fomit-frame-pointer -fno-asynchronous-unwind-tables -fno-unwind-tables -DNDEBUG -o libmd5_service_opt.so back_python/src/services/hash_service/md5_service_opt.c
#include <stddef.h>
#include <stdint.h>
#include <stdlib.h>
#include <string.h>
#include <sys/types.h>

#if defined(__GNUC__) || defined(__clang__)
#define MD5_ALWAYS_INLINE __attribute__((always_inline)) inline
#else
#define MD5_ALWAYS_INLINE inline
#endif

static MD5_ALWAYS_INLINE uint32_t rotl32(uint32_t x, uint32_t n) {
#if defined(__has_builtin)
#if __has_builtin(__builtin_rotateleft32)
    return __builtin_rotateleft32(x, n);
#endif
#endif
#if defined(_MSC_VER)
    return _rotl(x, n);
#else
    return (x << n) | (x >> (32 - n));
#endif
}

static MD5_ALWAYS_INLINE uint32_t load_le32(const uint8_t* p) {
    uint32_t v;
    __builtin_memcpy(&v, p, sizeof(v));
#if defined(__BYTE_ORDER__) && (__BYTE_ORDER__ == __ORDER_BIG_ENDIAN__)
    v = __builtin_bswap32(v);
#endif
    return v;
}

static MD5_ALWAYS_INLINE void store_le32(uint8_t* p, uint32_t v) {
#if defined(__BYTE_ORDER__) && (__BYTE_ORDER__ == __ORDER_BIG_ENDIAN__)
    v = __builtin_bswap32(v);
#endif
    __builtin_memcpy(p, &v, sizeof(v));
}

typedef struct {
    uint32_t A, B, C, D;
    uint8_t buffer[64];
    size_t buffer_len;
    uint64_t total_len;
} Context;

static MD5_ALWAYS_INLINE void hash_data_md5(const uint8_t* restrict data,
                                            uint32_t* restrict A,
                                            uint32_t* restrict B,
                                            uint32_t* restrict C,
                                            uint32_t* restrict D) {
    uint32_t M[16];
    for (size_t i = 0, j = 0; i < 16; i++, j += 4) M[i] = load_le32(data + j);

    static const uint8_t rotate[64] = {
        7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
        5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
        4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
        6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21
    };

    static const uint32_t T[] = {
        0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee,
        0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
        0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be,
        0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
        0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa,
        0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
        0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed,
        0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
        0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c,
        0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
        0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05,
        0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
        0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039,
        0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
        0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1,
        0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391};

    static const uint8_t g_idx[64] = {
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
            1, 6, 11, 0, 5, 10, 15, 4, 9, 14, 3, 8, 13, 2, 7, 12,
            5, 8, 11, 14, 1, 4, 7, 10, 13, 0, 3, 6, 9, 12, 15, 2,
            0, 7, 14, 5, 12, 3, 10, 1, 8, 15, 6, 13, 4, 11, 2, 9
    };

    uint32_t a = *A, b = *B, c = *C, d = *D, temp, f;
#if defined(__clang__) || defined(__GNUC__)
#pragma unroll
#endif
    for (uint32_t i = 0; i < 16; i++) {
        f = (b & c) | ((~b) & d);
        temp = d, d = c, c = b;
        b = b + rotl32(a + f + T[i] + M[g_idx[i]], rotate[i]);
        a = temp;
    }
#if defined(__clang__) || defined(__GNUC__)
#pragma unroll
#endif
    for (uint32_t i = 16; i < 32; i++) {
        f = (b & d) | (c & (~d));
        temp = d, d = c, c = b;
        b = b + rotl32(a + f + T[i] + M[g_idx[i]], rotate[i]);
        a = temp;
    }
#if defined(__clang__) || defined(__GNUC__)
#pragma unroll
#endif
    for (uint32_t i = 32; i < 48; i++) {
        f = b ^ c ^ d;
        temp = d, d = c, c = b;
        b = b + rotl32(a + f + T[i] + M[g_idx[i]], rotate[i]);
        a = temp;
    }
#if defined(__clang__) || defined(__GNUC__)
#pragma unroll
#endif
    for (uint32_t i = 48; i < 64; i++) {
        f = c ^ (b | (~d));
        temp = d, d = c, c = b;
        b = b + rotl32(a + f + T[i] + M[g_idx[i]], rotate[i]);
        a = temp;
    }
    *A += a, *B += b, *C += c, *D += d;
}

void md5_init(Context* ctx) {
    ctx->A = 0x67452301;
    ctx->B = 0xefcdab89;
    ctx->C = 0x98badcfe;
    ctx->D = 0x10325476;
    ctx->buffer_len = 0;
    ctx->total_len = 0;
}

void md5_update(Context* ctx, const uint8_t* restrict data, size_t len) {
    ctx->total_len += len;

    if (ctx->buffer_len > 0) {
        size_t take = 64 - ctx->buffer_len;
        if (take > len) take = len;
        memcpy(ctx->buffer + ctx->buffer_len, data, take);
        ctx->buffer_len += take;
        data += take;
        len -= take;

        if (ctx->buffer_len == 64) {
            hash_data_md5(ctx->buffer, &ctx->A, &ctx->B, &ctx->C, &ctx->D);
            ctx->buffer_len = 0;
        }
    }

    while (len >= 64) {
        hash_data_md5(data, &ctx->A, &ctx->B, &ctx->C, &ctx->D);
        len -= 64;
        data += 64;
    }

    if (len > 0) {
        memcpy(ctx->buffer, data, len);
        ctx->buffer_len += len;
    }
}

void md5_final(Context* ctx, uint8_t out[16]) {
    ctx->buffer[ctx->buffer_len++] = 0x80;
    if (ctx->buffer_len > 56) {
        memset(ctx->buffer + ctx->buffer_len, 0x00, 64 - ctx->buffer_len);
        hash_data_md5(ctx->buffer, &ctx->A, &ctx->B, &ctx->C, &ctx->D);

        ctx->buffer_len = 0;
    }

    if (ctx->buffer_len < 56) {
        memset(ctx->buffer + ctx->buffer_len, 0x00, 56 - ctx->buffer_len);
        ctx->buffer_len = 56;
    } else if (ctx->buffer_len > 56) {
        memset(ctx->buffer + ctx->buffer_len, 0x00, 64 - ctx->buffer_len);
        hash_data_md5(ctx->buffer, &ctx->A, &ctx->B, &ctx->C, &ctx->D);
        memset(ctx->buffer, 0x00, 56);
        ctx->buffer_len = 56;
    }

    {
        uint64_t bit_len = ctx->total_len * 8;
        for (size_t i = 0; i < 8; i++) ctx->buffer[56 + i] = (bit_len >> (8 * i)) & 0xff;
    }

    hash_data_md5(ctx->buffer, &ctx->A, &ctx->B, &ctx->C, &ctx->D);
    ctx->buffer_len = 0;
    ctx->total_len = 0;

    store_le32(out, ctx->A);
    store_le32(out + 4, ctx->B);
    store_le32(out + 8, ctx->C);
    store_le32(out + 12, ctx->D);
}
