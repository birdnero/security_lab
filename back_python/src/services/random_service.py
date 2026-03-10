import math
import random
from collections.abc import Callable

from src.schemas.random import (
    BitBalanceResponse,
    CompareResponse,
    GenConfig,
    PiEstimateResponse,
    SequencePeriodResponse,
)


class RandomService:
    @staticmethod
    def gcd_euclid(a: int, b: int) -> int:
        a = abs(a)
        b = abs(b)
        while b != 0:
            a, b = b, a % b
        return a

    @staticmethod
    def generate(config: GenConfig, n: int) -> list[int]:
        x = config.x0
        values = []
        for _ in range(n):
            x = (config.a * x + config.c) % config.m
            values.append(x)
        return values

    @staticmethod
    def chizaru(config: GenConfig, n: int) -> PiEstimateResponse:
        values = RandomService.generate(config, 2 * n)
        coprime_count = 0
        total_pairs = 0

        for i in range(0, len(values) - 1, 2):
            total_pairs += 1
            if RandomService.gcd_euclid(values[i], values[i + 1]) == 1:
                coprime_count += 1

        if coprime_count == 0:
            pi_estimate = float("inf")
        else:
            pi_estimate = math.sqrt((6.0 * total_pairs) / coprime_count)

        return PiEstimateResponse(
            pi_estimate=pi_estimate,
            abs_error_vs_math_pi=abs(pi_estimate - math.pi) if math.isfinite(pi_estimate) else float("inf"),
        )

    @staticmethod
    def test_01_amount(gen_values: Callable[[int], list[int]], n: int) -> BitBalanceResponse:
        zeros = 0
        ones = 0

        for xi in gen_values(n):
            if xi == 0:
                zeros += 1
                continue

            while xi > 0:
                if xi % 2 == 0:
                    zeros += 1
                else:
                    ones += 1
                xi //= 2

        ratio = zeros / ones if ones > 0 else float("inf")
        return BitBalanceResponse(zeros=zeros, ones=ones, ratio_zero_to_one=ratio)

    @staticmethod
    def sequence_period(config: GenConfig) -> SequencePeriodResponse:
        seen: set[int] = set()
        prev = config.x0
        steps = 0

        while steps < 1_000_000:
            xi = RandomService.generate(GenConfig(x0=prev, m=config.m, a=config.a, c=config.c), 1)[0]
            if xi in seen:
                return SequencePeriodResponse(period=steps, reached_limit=False)

            seen.add(xi)
            prev = xi
            steps += 1

        return SequencePeriodResponse(period=steps, reached_limit=True)

    @staticmethod
    def compare_with_builtin(config: GenConfig, n: int) -> CompareResponse:
        generator_stats = RandomService.test_01_amount(lambda count: RandomService.generate(config, count), n)

        random.seed(config.x0)
        builtin_stats = RandomService.test_01_amount(
            lambda count: [random.randint(0, 2**31 - 1) for _ in range(count)],
            n,
        )

        return CompareResponse(generator=generator_stats, builtin=builtin_stats)
