#include <stdio.h>

void silly_func() {
    printf("In silly func\n");
}

int main() {

  int i;

  for(i = 0; i < 10; i++) {
    printf("Hello Test: %d\n", i);
    silly_func();
  }

  return 0;
}
