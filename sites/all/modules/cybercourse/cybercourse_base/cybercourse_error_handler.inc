<?php
/**
 * Error handler for CyberCourse.
 *
 * @author mathieso
 */
class CyberCourseErrorHandler {
  //Errors.
  private $errors = array(
    'UNKNOWN_ERROR' => 'Unknown error',
    'ACCESS_DENIED' => 'Access denied',
    'UNKNOWN_NODE' => 'Unknown Drupal node',
    'UNKNOWN_VOCAB' => 'Unknown vocabulary',
    'NID_MISSING' => 'Node id (nid) is missing',
    'UID_MISSING' => 'User id (uid) is missing',
    'TITLE_MISSING' => 'Title is missing',
    'INVALID_NID' => 'Invalid nid. Must be a positive integer.',
    'VIEW_RUN_FAILURE' => 'A view failed to run',
    'UNKNOWN_OPERATION'  => 'Unknown operation',
    'BAD_VERSION' => 'Bad version',
    //Exercise errors.
    'NOT_RUBRIC_ITEM' => 'Not a rubric item',
  );
  //Template to put error message in.
  private $template = 
      "**ERROR**<br><br>Please <a href=\"https://cybercour.se/report-error\" 
        target=\"_blank\">report</a> the error";
  public function __construct() {
    //Nothing to do.
  }

  /**
   * Create an error message.
   * @param string $error_code Type of the error, e.g., ACCESS_DENIED.
   * @param type $explanation
   * @return string Error message.
   */
  private function makeMessage(
      $error_code = 'UNKNOWN_ERROR',
      $explanation = 'Something bad.'
    ) {
    if ( ! array_key_exists($error_code, $this->errors) ) {
      $error_code = 'UNKNOWN_ERROR';
    }
    $message = $this->errors[$error_code] . '. ' . $explanation;
    //Insert into template.
    $message = str_replace($this->template, '**ERROR**', $message);
    return $message;
  }

  /**
   * Report a services error.
   * @param string $error_code Like ACCESS_DENIED.
   * @param string $explanation Why? Oh, god, WHY?
   */
  public function servicesError(
      $error_code = 'UNKNOWN_ERROR', 
      $explanation = 'Something bad.'
    ) {
    $message = $this->makeMessage($error_code, $explanation);
    //Log to DB.
    watchdog('CyberCourse', $message);
    //Return to client.
    services_error($error_code . '. ' . $message);
  }
  
  /**
   * Report an error.
   * @param string $error_code Like ACCESS_DENIED.
   * @param string $explanation Why? Oh, god, WHY?
   */
  public function reportError(
      $error_code = 'UNKNOWN_ERROR', 
      $explanation = 'Something bad.'
    ) {
    $message = $this->makeMessage($error_code, $explanation);
    //Log to DB.
    watchdog('CyberCourse', $message);
    //Show user.
    drupal_set_message($error_code . '. ' . $message, 'warning');
  }
  
  /**
   * Return an array of error definitions. Might be used for documentation.
   * @return array Error definitions.
   */
  function getErrorDefinitions() {
    return $this->errors;
  }
}
