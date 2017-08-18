all:
	gcc main.c -g -o test.elf

clean:
	rm -fr test.elf
