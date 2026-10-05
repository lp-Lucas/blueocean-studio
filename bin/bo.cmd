@echo off
if defined BO_ELECTRON (
  set ELECTRON_RUN_AS_NODE=1
  "%BO_ELECTRON%" "%~dp0..\bo.mjs" %*
) else (
  node "%~dp0..\bo.mjs" %*
)
