# 0007 Data Generation Pipeline

## Status

Accepted

## Context

Mode B projects need a data-generation pipeline. This project is Mode A.

## Decision

Skip the data-generation pipeline for v1.

## Consequences

There is no `make data` target and no generated artifact cadence.

## Alternatives Considered

Prebuilding model assets was rejected because v1 uses optional user-supplied ONNX files.
