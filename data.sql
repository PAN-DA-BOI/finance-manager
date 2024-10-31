CREATE TABLE IF NOT EXISTS `transactions` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) DEFAULT NULL,
  `first_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `password` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`user_id`)
)

INSERT INTO `user_details` (`user_id`, `username`, `first_name`, `last_name`, `password`) VALUES
(1, 'admin', 'tester', 'mctestson', 'password')
SELECT * FROM user_id