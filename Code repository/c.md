八进制：必须以0开头
017  0377 07777

十六进制：必须以0x开头
0x1 0xF 0xFF 0xFFFF 0xFFFFFF 

读取无符号整数
scanf("%u", &num); /*%u表示无符号整数 */
scanf("%o", &num);/*%o表示八进制数 */
scanf("%x", &num);/*%x表示十六进制数 */

如果是短整数，在d,o,u,x前面加上h
scanf("%hd", &num); /*%hd表示短整数 */