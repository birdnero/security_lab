//? to compile in shared: gcc -shared -fPIC -O2 -o libhash_service.so back_python/src/services/hash_service/md5_service.c
#include <stddef.h>
#include <stdint.h>
#include <stdlib.h>
#include <string.h>
#include <sys/types.h>

#define leftrotate(x, n) (((x) << (n)) | ((x) >> (32 - (n))))
#define MD5_BLOCK_SIZE 64

typedef struct {
    uint32_t A, B, C, D;
    uint8_t buffer[MD5_BLOCK_SIZE];
    size_t buffer_len;
    uint64_t total_len;
} Context;

void hash_data_md5(const uint8_t* data, uint32_t* A, uint32_t* B, uint32_t* C, uint32_t* D) {
    uint32_t M[16];
    for (size_t i = 0, j = 4 * i; i < 16; i++, j = i * 4) M[i] = (uint32_t)data[j] | ((uint32_t)data[j + 1] << 8) | ((uint32_t)data[j + 2] << 16) | ((uint32_t)data[j + 3] << 24);

    static const uint32_t rotate[] = {7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10, 15, 21};

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

    static const uint32_t order[4][2] = {{0, 1}, {1, 5}, {5, 3}, {0, 7}};

    uint32_t a = *A, b = *B, c = *C, d = *D, temp, f;
    for (size_t round = 0; round < 4; round++) {
        for (size_t step = 0; step < 16; step++) {
            uint32_t g = (order[round][0] + order[round][1] * step) % 16;
            uint32_t i = 16 * round + step;
            if (round == 0)
                f = (b & c) | ((~b) & d);
            else if (round == 1)
                f = (b & d) | (c & (~d));
            else if (round == 2)
                f = b ^ c ^ d;
            else if (round == 3)
                f = c ^ (b | (~d));

            temp = d, d = c, c = b;
            b = b + leftrotate(a + f + T[i] + M[g], rotate[round * 4 + (step % 4)]);
            a = temp;
        }
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

void md5_update(Context* ctx, const uint8_t* data, size_t len) {
    ctx->total_len += len;

    if (ctx->buffer_len > 0) {
        size_t take = MD5_BLOCK_SIZE - ctx->buffer_len;
        if (take > len) take = len;
        memcpy(ctx->buffer + ctx->buffer_len, data, take);
        ctx->buffer_len += take;
        data += take;
        len -= take;

        if (ctx->buffer_len == MD5_BLOCK_SIZE) {
            hash_data_md5(ctx->buffer, &ctx->A, &ctx->B, &ctx->C, &ctx->D);
            ctx->buffer_len = 0;
        }
    }

    while (len >= MD5_BLOCK_SIZE) {
        hash_data_md5(data, &ctx->A, &ctx->B, &ctx->C, &ctx->D);
        len -= MD5_BLOCK_SIZE;
        data += MD5_BLOCK_SIZE;
    }

    if (len > 0) {
        memcpy(ctx->buffer, data, len);
        ctx->buffer_len += len;
    }
}

void md5_final(Context* ctx, uint8_t out[16]) {
    ctx->buffer[ctx->buffer_len++] = 0x80;
    if (ctx->buffer_len > 56) {
        memset(ctx->buffer + ctx->buffer_len, 0x00, MD5_BLOCK_SIZE - ctx->buffer_len);
        hash_data_md5(ctx->buffer, &ctx->A, &ctx->B, &ctx->C, &ctx->D);

        ctx->buffer_len = 0;
    }

    memset(ctx->buffer + ctx->buffer_len, 0x00, MD5_BLOCK_SIZE - ctx->buffer_len);
    ctx->total_len *= 8;
    for (size_t i = 0; i < 8; i++) ctx->buffer[56 + i] = (ctx->total_len >> (8 * i)) & 0xff;

    hash_data_md5(ctx->buffer, &ctx->A, &ctx->B, &ctx->C, &ctx->D);
    ctx->buffer_len = 0;
    ctx->total_len = 0;

    for (size_t i = 0; i < 4; i++) out[i] = (ctx->A >> (8 * i)) & 0xff;
    for (size_t i = 0; i < 4; i++) out[4 + i] = (ctx->B >> (8 * i)) & 0xff;
    for (size_t i = 0; i < 4; i++) out[8 + i] = (ctx->C >> (8 * i)) & 0xff;
    for (size_t i = 0; i < 4; i++) out[12 + i] = (ctx->D >> (8 * i)) & 0xff;
}
